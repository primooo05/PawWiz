import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { API_BASE } from '../lib/config.js';
import type { BehaviorDecodeResponse } from '../../../pawwiz-backend/src/types/shared.js';

export interface ChatMessage {
  id: string;
  speaker: 'wiz' | 'user';
  text: string;
  timestamp: Date;
  analysis?: BehaviorDecodeResponse;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  messages: ChatMessage[];
}

export function useBehaviorChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const msgIdCounter = useRef(1);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const getAuthHeaders = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token || ''}`,
    };
  };

  const generateLocalId = () => `local-${Date.now()}-${msgIdCounter.current++}`;

  // ─── Load chats from backend on mount ───────────────────────────────────────
  useEffect(() => {
    let active = true;

    const loadChats = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE}/api/behavior/chats`, { headers });

        if (!res.ok) return;

        const data = await res.json();
        if (!active) return;

        if (data.chats && data.chats.length > 0) {
          const mapped: ChatSession[] = data.chats.map((chat: any) => ({
            id: chat.id,
            title: chat.title,
            createdAt: new Date(chat.createdAt),
            messages: chat.messages.map((msg: any) => ({
              id: msg.id,
              speaker: msg.speaker as 'wiz' | 'user',
              text: msg.text,
              timestamp: new Date(msg.createdAt),
              analysis: msg.analysis || undefined,
            })),
          }));
          setSessions(mapped);
          setActiveSessionId(mapped[0].id);
        } else {
          // No chats exist — create one
          const newChat = await createChatOnServer();
          if (active && newChat) {
            setSessions([newChat]);
            setActiveSessionId(newChat.id);
          }
        }
      } catch {
        // Offline fallback — create a local-only session
        const fallback = createLocalSession();
        setSessions([fallback]);
        setActiveSessionId(fallback.id);
      } finally {
        if (active) setIsInitialized(true);
      }
    };

    loadChats();
    return () => { active = false; };
  }, []);

  // ─── Server helpers ─────────────────────────────────────────────────────────
  const createChatOnServer = async (title?: string): Promise<ChatSession | null> => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/behavior/chats`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title }),
      });
      if (!res.ok) return null;
      const chat = await res.json();
      return {
        id: chat.id,
        title: chat.title,
        createdAt: new Date(chat.createdAt),
        messages: (chat.messages || []).map((msg: any) => ({
          id: msg.id,
          speaker: msg.speaker as 'wiz' | 'user',
          text: msg.text,
          timestamp: new Date(msg.createdAt),
          analysis: msg.analysis || undefined,
        })),
      };
    } catch {
      return null;
    }
  };

  const saveMessageToServer = async (
    chatId: string,
    speaker: 'wiz' | 'user',
    text: string,
    analysis?: BehaviorDecodeResponse
  ) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_BASE}/api/behavior/chats/${chatId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ speaker, text, analysis: analysis || null }),
      });
    } catch {
      // Silent fail — messages already shown in UI
    }
  };

  const deleteChatOnServer = async (chatId: string) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_BASE}/api/behavior/chats/${chatId}`, {
        method: 'DELETE',
        headers,
      });
    } catch {
      // Silent
    }
  };

  // ─── Local session fallback ─────────────────────────────────────────────────
  const createLocalSession = (): ChatSession => ({
    id: `local-session-${Date.now()}`,
    title: 'New Chat',
    createdAt: new Date(),
    messages: [
      {
        id: 'welcome',
        speaker: 'wiz',
        text: "Hey there! 🐾 I'm Wiz, your cat behavior specialist. Describe what your cat is doing — vocalizations, body language, or context — and I'll decode it for you.",
        timestamp: new Date(),
      },
    ],
  });

  // ─── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading || !activeSessionId) return;

      const userMsg: ChatMessage = {
        id: generateLocalId(),
        speaker: 'user',
        text: text.trim(),
        timestamp: new Date(),
      };

      // Optimistic UI update
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                title: s.messages.filter((m) => m.speaker === 'user').length === 0
                  ? text.trim().slice(0, 30) + (text.trim().length > 30 ? '…' : '')
                  : s.title,
                messages: [...s.messages, userMsg],
              }
            : s
        )
      );

      setInputValue('');
      setIsLoading(true);

      // Persist user message to server
      saveMessageToServer(activeSessionId, 'user', text.trim());

      try {
        const headers = await getAuthHeaders();
        const parsed = parseUserInput(text.trim());

        const response = await fetch(`${API_BASE}/api/gemini/behavior/decode`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            vocalDescription: parsed.vocal,
            bodyLanguageSigns: parsed.bodySigns,
            context: parsed.context,
          }),
        });

        let wizText: string;
        let analysis: BehaviorDecodeResponse | undefined;

        if (response.ok) {
          const data: BehaviorDecodeResponse = await response.json();
          analysis = data;
          wizText = formatAnalysisResponse(data);
        } else {
          wizText =
            "I couldn't fully analyze that right now. Could you describe the behavior in more detail? Try mentioning specific sounds (hissing, chirping, meowing) and body language (tail position, ear position, pupils).";
        }

        const wizMsg: ChatMessage = {
          id: generateLocalId(),
          speaker: 'wiz',
          text: wizText,
          timestamp: new Date(),
          analysis,
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId ? { ...s, messages: [...s.messages, wizMsg] } : s
          )
        );

        // Persist Wiz response to server
        saveMessageToServer(activeSessionId, 'wiz', wizText, analysis);
      } catch {
        const errorMsg: ChatMessage = {
          id: generateLocalId(),
          speaker: 'wiz',
          text: "Something went wrong on my end. Try again in a moment — I'll be ready! 🐾",
          timestamp: new Date(),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeSessionId, isLoading]
  );

  // ─── Create new session ─────────────────────────────────────────────────────
  const createNewSession = useCallback(async () => {
    const newChat = await createChatOnServer();
    if (newChat) {
      setSessions((prev) => [newChat, ...prev]);
      setActiveSessionId(newChat.id);
    } else {
      // Fallback to local
      const local = createLocalSession();
      setSessions((prev) => [local, ...prev]);
      setActiveSessionId(local.id);
    }
  }, []);

  // ─── Delete session ─────────────────────────────────────────────────────────
  const deleteSession = useCallback(
    async (sessionId: string) => {
      // Delete on server
      deleteChatOnServer(sessionId);

      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        if (filtered.length === 0) {
          // Will create new on next render cycle
          return prev;
        }
        if (activeSessionId === sessionId) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });

      // If no sessions remain, create a new one
      setSessions((prev) => {
        if (prev.length === 0 || (prev.length === 1 && prev[0].id === sessionId)) {
          return prev; // handled below
        }
        return prev.filter((s) => s.id !== sessionId);
      });
    },
    [activeSessionId]
  );

  // If all sessions are deleted, auto-create
  useEffect(() => {
    if (isInitialized && sessions.length === 0) {
      createNewSession();
    }
  }, [sessions.length, isInitialized, createNewSession]);

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    isLoading,
    inputValue,
    setInputValue,
    sendMessage,
    createNewSession,
    deleteSession,
    isInitialized,
  };
}

/**
 * Simple parser that extracts vocal descriptions, body signs, and context
 * from a free-form user message.
 */
function parseUserInput(text: string) {
  const knownSigns = [
    'ears pinned back',
    'ears back',
    'tail twitching',
    'tail high',
    'tail puffed',
    'pupils dilated',
    'slow blinking',
    'making biscuits',
    'kneading',
    'arched back',
    'belly exposed',
    'crouching',
    'whiskers forward',
    'whiskers back',
  ];

  const knownVocals = [
    'hiss',
    'hissing',
    'meow',
    'meowing',
    'chirp',
    'chirping',
    'trill',
    'trilling',
    'purr',
    'purring',
    'growl',
    'growling',
    'yowl',
    'yowling',
    'chatter',
    'chattering',
  ];

  const lowerText = text.toLowerCase();
  const detectedSigns = knownSigns.filter((s) => lowerText.includes(s));
  const detectedVocals = knownVocals.filter((v) => lowerText.includes(v));

  return {
    vocal: detectedVocals.length > 0 ? detectedVocals.join(', ') : text.slice(0, 80),
    bodySigns: detectedSigns.length > 0 ? detectedSigns : ['observing behavior'],
    context: text,
  };
}

function formatAnalysisResponse(data: BehaviorDecodeResponse): string {
  const stateEmoji: Record<string, string> = {
    'Happy/Relaxed': '😺',
    'Anxious/Stressed': '😿',
    Playful: '🎾',
    'Aggressive/Defensive': '🙀',
    Overstimulated: '⚡',
    'Sick/In Pain': '🩺',
    Unknown: '❓',
  };

  const emoji = stateEmoji[data.catState] || '🐱';
  const confidence = Math.round(data.confidenceScore * 100);

  let response = `${emoji} **${data.catState}** (${confidence}% confidence)\n\n`;
  response += `${data.decodedMeaning}\n\n`;
  response += `**What to do:**\n`;
  data.actionPlan.forEach((action) => {
    response += `• ${action}\n`;
  });

  return response;
}
