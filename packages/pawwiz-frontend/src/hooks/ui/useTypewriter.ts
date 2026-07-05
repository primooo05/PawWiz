import { useState, useEffect, useCallback, useRef } from 'react';

interface TypewriterState {
  text: string;
  isTyping: boolean;
  showBubble: boolean;
}

interface TypewriterOptions {
  speed?: number;
  onComplete?: () => void;
}

/**
 * Isolated typewriter hook that manages character-by-character text reveal.
 * Safely tears down intervals via useEffect cleanup.
 */
export function useTypewriter() {
  const [state, setState] = useState<TypewriterState>({
    text: '',
    isTyping: false,
    showBubble: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const startTyping = useCallback(
    (fullText: string, options: TypewriterOptions = {}) => {
      const { speed = 45, onComplete } = options;

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      onCompleteRef.current = onComplete ?? null;

      setState({ text: '', isTyping: true, showBubble: true });

      let index = 0;
      let currentText = '';

      intervalRef.current = setInterval(() => {
        if (index < fullText.length) {
          currentText += fullText[index];
          setState({ text: currentText, isTyping: true, showBubble: true });
          index++;
        } else {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setState((prev) => ({ ...prev, isTyping: false }));
          onCompleteRef.current?.();
        }
      }, speed);
    },
    []
  );

  const showStaticBubble = useCallback((text: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState({ text, isTyping: false, showBubble: true });
  }, []);

  const hideBubble = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState({ text: '', isTyping: false, showBubble: false });
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState({ text: '', isTyping: false, showBubble: false });
  }, []);

  return {
    bubbleText: state.text,
    isTyping: state.isTyping,
    showBubble: state.showBubble,
    startTyping,
    showStaticBubble,
    hideBubble,
    reset,
  };
}
