import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ChatMessage } from '../../hooks/useBehaviorChat';
import wizMascot from '../../assets/Chat_Behavior_Icon.svg';
import { 
  SkeletonHeader, 
  SkeletonMessages 
} from '../skeletons/SkeletonLoader';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: (text: string) => void;
  onToggleSidebar: () => void;
  isInitialLoading?: boolean;
}

const PawIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="6.5" cy="11.5" r="2" />
    <circle cx="10" cy="7.5" r="2" />
    <circle cx="14" cy="7.5" r="2" />
    <circle cx="17.5" cy="11.5" r="2" />
    <path d="M7.5 17c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4c0 1.5-1.5 2.5-4.5 2.5s-4.5-1-4.5-2.5z" />
  </svg>
);

/**
 * Renders markdown-like formatting:
 * - **bold** → <strong>
 * - Lines starting with "• " → bullet items
 * - Empty lines → spacing
 */
function renderMessageText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Replace **bold** patterns
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={j} className="font-extrabold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part ? <span key={j}>{part}</span> : null;
    });

    // Bullet point lines: "• Some text here"
    if (line.startsWith('• ')) {
      const bulletContent = line.slice(2); // Remove "• " prefix
      const bulletParts = bulletContent.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={j} className="font-extrabold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part ? <span key={j}>{part}</span> : null;
      });

      return (
        <div key={i} className="pl-1 flex items-start gap-2 mt-1">
          <span className="text-[#2ec4b6] font-black text-sm leading-none mt-0.5">•</span>
          <span className="flex-1">{bulletParts}</span>
        </div>
      );
    }

    // Empty line = paragraph break
    if (line === '') {
      return <div key={i} className="h-2" />;
    }

    return (
      <p key={i} className={i > 0 ? 'mt-0.5' : ''}>
        {rendered}
      </p>
    );
  });
}

// ─── Typewriter bubble: streams Wiz text letter-by-letter ─────────────────────
interface TypewriterBubbleProps {
  message: ChatMessage;
  displayedLength: number;
  setDisplayedLength: (id: string, length: number) => void;
}

const TypewriterBubble: React.FC<TypewriterBubbleProps> = ({
  message,
  displayedLength,
  setDisplayedLength,
}) => {
  const fullText = message.text;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const speed = Math.max(12, Math.min(25, 1200 / fullText.length)); // adaptive speed

    intervalRef.current = setInterval(() => {
      setDisplayedLength(message.id, displayedLength + 1);
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [displayedLength, message.id, fullText.length, setDisplayedLength]);

  const visibleText = fullText.slice(0, displayedLength);
  const isComplete = displayedLength >= fullText.length;

  return (
    <div className="text-left">
      {renderMessageText(visibleText)}
      {!isComplete && (
        <span className="inline-block w-[2px] h-[14px] bg-[#2ec4b6] ml-0.5 align-middle animate-pulse" />
      )}
    </div>
  );
};

// ─── Thinking dots: bouncing animation before response streams ─────────────────
const ThinkingDots: React.FC = () => (
  <div className="flex items-end gap-2.5 animate-fadeInUp">
    <div className="w-8 h-8 rounded-full bg-[#2ec4b6] flex-shrink-0 flex items-center justify-center mb-0.5 shadow-sm">
      <PawIcon className="w-4.5 h-4.5 text-white" />
    </div>
    <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-black text-[#2ec4b6] uppercase tracking-wider mr-2">
          Thinking
        </span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[#2ec4b6] inline-block"
            style={{
              animation: 'thinkingBounce 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  inputValue,
  onInputChange,
  onSend,
  onToggleSidebar,
  isInitialLoading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Tracks how many characters have been revealed per message during typewriter animation.
  const [typewriterState, setTypewriterState] = useState<Record<string, number>>({});
  // Persists IDs of messages whose typewriter animation has fully completed.
  // Once in this set a message always renders statically — survives re-renders.
  const completedMessageIds = useRef<Set<string>>(new Set());
  // Track which message's chips have been clicked — disables all chips for that message
  const [clickedChipMessageId, setClickedChipMessageId] = useState<string | null>(null);
  // Snapshot the message IDs that were present once chat history finished loading
  // from the server. These are pre-existing and should never typewrite.
  // NOTE: captured lazily (once, after loading completes) rather than on the
  // component's first render — history loads asynchronously, so an eager
  // useRef(new Set(messages...)) would freeze on an empty set before the
  // fetch resolves. That stale-empty snapshot is what caused the typewriter
  // to replay every historical message whenever ChatWindow remounted
  // (e.g. after navigating away and back to the behavior chat tab).
  const initialMessageIdsRef = useRef<Set<string>>(new Set());
  const hasSnapshotRef = useRef(false);

  useEffect(() => {
    if (!isInitialLoading && !hasSnapshotRef.current) {
      initialMessageIdsRef.current = new Set(messages.map((m) => m.id));
      hasSnapshotRef.current = true;
    }
  }, [isInitialLoading, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const setDisplayedLength = useCallback((messageId: string, length: number) => {
    const fullLength = messages.find((m) => m.id === messageId)?.text.length || 0;
    const clamped = Math.min(length, fullLength);
    if (clamped >= fullLength) {
      // Animation complete — mark as seen so it never re-animates
      completedMessageIds.current.add(messageId);
    }
    setTypewriterState((prev) => ({ ...prev, [messageId]: clamped }));
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSend(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] overflow-hidden">
      {/* Inline keyframes and custom scrollbar styles */}
      <style>{`
        @keyframes thinkingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        
        /* Custom scrollbar styling */
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #2ec4b6;
          border-radius: 8px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #27a7a0;
        }
        .scrollbar-custom::-webkit-scrollbar-button {
          display: none;
        }
        
        /* Firefox scrollbar */
        .scrollbar-custom {
          scrollbar-color: #2ec4b6 transparent;
          scrollbar-width: thin;
        }
      `}</style>

      {/* Chat Header */}
      {isInitialLoading ? (
        <SkeletonHeader />
      ) : (
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b-2 border-slate-900 bg-gradient-to-r from-[#15AFB4] to-[#1bc5c5]">
          {/* Hamburger for mobile */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white cursor-pointer"
            aria-label="Toggle chat sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Wiz avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden border-2 border-white/50">
              <img src={wizMascot} alt="Wiz" className="w-8 h-8 object-contain" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#15AFB4]" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-black text-white tracking-tight leading-none">Wiz</p>
            <p className="text-[10px] text-white/80 font-bold mt-0.5">
              Behavior Specialist · PawWiz AI
            </p>
          </div>

          {/* Status badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 text-[#2ec4b6] border border-[#2ec4b6]/30 rounded-lg px-2.5 py-1.5 shadow-[0_0_12px_rgba(46,196,182,0.15)]">
            <PawIcon className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black tracking-wider uppercase">ONLINE</span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 bg-slate-50/40 scrollbar-custom">
        {isInitialLoading ? (
          <SkeletonMessages />
        ) : (
          <>
            {messages.map((msg) => {
          const isWiz = msg.speaker === 'wiz';
          // Typewrite only when ALL three are true:
          // 1. It's a Wiz message
          // 2. It wasn't present when the component mounted (not history)
          // 3. Its animation hasn't completed yet (not already seen this session)
          const isNewMessage = !initialMessageIdsRef.current.has(msg.id);
          const isCompleted = completedMessageIds.current.has(msg.id);
          const shouldTypewrite = isWiz && isNewMessage && !isCompleted;
          // New unseen messages start at 0; everything else renders at full length.
          const displayedLen = shouldTypewrite
            ? (typewriterState[msg.id] ?? 0)
            : msg.text.length;
          // Chips for this message are disabled once clicked or while loading
          const chipsDisabled = isLoading || clickedChipMessageId === msg.id;

          return (
            <div key={msg.id}>
            <div  
              className={`flex items-end gap-2.5 animate-fadeInUp ${
                msg.speaker === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              {isWiz ? (
                <div className="w-8 h-8 rounded-full bg-[#2ec4b6] flex-shrink-0 flex items-center justify-center mb-0.5 shadow-sm">
                  <PawIcon className="w-4.5 h-4.5 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center mb-0.5 text-sm">
                  🧑
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm ${
                  isWiz
                    ? 'bg-white border border-slate-200/80 text-slate-700 rounded-bl-sm'
                    : 'bg-[#FFB870] text-slate-900 rounded-br-sm border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]'
                }`}
              >
                {isWiz && (
                  <span className="text-[9px] font-black text-[#2ec4b6] uppercase tracking-wider block mb-1">
                    Wiz · Behavior AI
                  </span>
                )}

                {/* Typewriter for new Wiz messages, static for everything else */}
                {shouldTypewrite ? (
                  <TypewriterBubble
                    message={msg}
                    displayedLength={displayedLen}
                    setDisplayedLength={setDisplayedLength}
                  />
                ) : (
                  <div className="text-left">{renderMessageText(msg.text)}</div>
                )}

                <span className="text-[9px] text-slate-400 block mt-1.5 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Suggestion Chips - rendered below the message */}
            {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
              <div className="ml-10 mt-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Try one of these:
                </p>
                <div className="flex flex-wrap gap-2 animate-fadeInUp">
                {msg.suggestedPrompts.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setClickedChipMessageId(msg.id);
                      onSend(suggestion);
                    }}
                    disabled={chipsDisabled}
                    className={`px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border-2 cursor-pointer active:scale-95 ${
                      chipsDisabled
                        ? 'opacity-40 pointer-events-none bg-slate-100 border-slate-200 text-slate-400'
                        : 'bg-gradient-to-r from-[#2ec4b6]/10 to-[#FFB870]/10 border-[#2ec4b6]/40 text-slate-700 hover:bg-gradient-to-r hover:from-[#2ec4b6]/20 hover:to-[#FFB870]/20 hover:border-[#2ec4b6]/60 shadow-sm'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
                {/* "Others" chip — focuses the input so the user can type freely */}
                <button
                  onClick={() => inputRef.current?.focus()}
                  disabled={chipsDisabled}
                  className={`px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border-2 cursor-pointer active:scale-95 ${
                    chipsDisabled
                      ? 'opacity-40 pointer-events-none bg-slate-100 border-slate-200 text-slate-400'
                      : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200 hover:border-slate-400 shadow-sm'
                  }`}
                >
                  ✏️ Others
                </button>
                </div>
              </div>
            )}
            </div>
          );
        })}

          {/* Thinking indicator (shown while waiting for API) */}
          {isLoading && <ThinkingDots />}

          <div ref={messagesEndRef} />
        </>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="px-4 sm:px-6 py-3.5 pb-6 md:pb-4 border-t-2 border-slate-200 bg-white"
      >
        <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-[#2ec4b6] focus-within:ring-2 focus-within:ring-[#2ec4b6]/20 transition-all">
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your cat's behavior..."
            className="flex-1 bg-transparent text-sm text-slate-700 font-medium placeholder-slate-400 outline-none min-w-0"
            disabled={isLoading}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer active:scale-95 ${
              inputValue.trim() && !isLoading
                ? 'bg-[#FFB870] border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                : 'bg-slate-200 opacity-50 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <svg
              className="w-4 h-4 text-slate-900"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>

        <p className="text-[9px] text-slate-400 font-bold mt-2 text-center">
          Tip: Mention sounds (hissing, chirping), body language (tail high, ears back), and what&apos;s happening around your cat.
        </p>
      </form>
    </div>
  );
};

export default ChatWindow;
