import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';
import type { BehaviorDecodeResponse, BehaviorCatContext } from '../../../../pawwiz-backend/src/types/shared.js';

export interface ChatMessage {
  id: string;
  speaker: 'wiz' | 'user';
  text: string;
  timestamp: Date;
  analysis?: BehaviorDecodeResponse;
  suggestedPrompts?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  catId?: string | null;
  messages: ChatMessage[];
}

export function useBehaviorChat(catId?: string | null) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const msgIdCounter = useRef(1);
  // Tracks the last user message text per session — used to detect duplicate sends.
  const lastUserTextRef = useRef<string>('');

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

  // ─── Load chats from backend on mount / when catId changes ─────────────────
  useEffect(() => {
    let active = true;
    // Reset session list immediately so stale chats from the previous cat
    // don't flash while the new cat's chats are loading.
    setSessions([]);
    setActiveSessionId('');
    setIsInitialized(false);

    const loadChats = async () => {
      try {
        const headers = await getAuthHeaders();
        const catQuery = catId ? `?catId=${encodeURIComponent(catId)}` : '';
        const res = await fetch(`${API_BASE}/api/behavior/chats${catQuery}`, { headers });

        if (!res.ok) return;

        const data = await res.json();
        if (!active) return;

        if (data.chats && data.chats.length > 0) {
          const mapped: ChatSession[] = data.chats.map((chat: any) => ({
            id: chat.id,
            title: chat.title,
            catId: chat.catId ?? null,
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
          // No chats for this cat — create one
          const newChat = await createChatOnServer(undefined, catId);
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
  }, [catId]); // re-run whenever the active cat changes

  // ─── Server helpers ─────────────────────────────────────────────────────────
  const createChatOnServer = async (title?: string, cId?: string | null): Promise<ChatSession | null> => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/behavior/chats`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, catId: cId ?? null }),
      });
      if (!res.ok) return null;
      const chat = await res.json();
      return {
        id: chat.id,
        title: chat.title,
        catId: chat.catId ?? null,
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

  // Reset duplicate-send tracking when the user switches to a different session.
  useEffect(() => {
    lastUserTextRef.current = '';
  }, [activeSessionId]);

  // ─── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string, catContext?: BehaviorCatContext) => {
      if (!text.trim() || isLoading || !activeSessionId) return;

      const trimmed = text.trim();

      // ── Duplicate-send guard ──────────────────────────────────────────────
      // If the user sends the exact same message twice in a row within the same
      // session, skip the API call and inject a local Wiz nudge instead.
      if (trimmed === lastUserTextRef.current) {
        const dupeUserMsg: ChatMessage = {
          id: generateLocalId(),
          speaker: 'user',
          text: trimmed,
          timestamp: new Date(),
        };
        const nudgeMsg: ChatMessage = {
          id: generateLocalId(),
          speaker: 'wiz',
          text: "Looks like you sent that again! 🐾 I already shared what I know — is there something else about your cat's behavior you'd like to explore?",
          timestamp: new Date(),
          suggestedPrompts: [
            "Tell me something different about what she's doing",
            'My cat has another behavior I\'m curious about',
          ],
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...s.messages, dupeUserMsg, nudgeMsg] }
              : s
          )
        );
        setInputValue('');
        saveMessageToServer(activeSessionId, 'user', trimmed);
        saveMessageToServer(activeSessionId, 'wiz', nudgeMsg.text);
        return;
      }

      // Record this send so the next identical message is caught above.
      lastUserTextRef.current = trimmed;

      const userMsg: ChatMessage = {
        id: generateLocalId(),
        speaker: 'user',
        text: trimmed,
        timestamp: new Date(),
      };

      // Optimistic UI update
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                title: s.messages.filter((m) => m.speaker === 'user').length === 0
                  ? trimmed.slice(0, 40) + (trimmed.length > 40 ? '…' : '')
                  : s.title,
                messages: [...s.messages, userMsg],
              }
            : s
        )
      );

      setInputValue('');
      setIsLoading(true);

      // Persist user message to server
      saveMessageToServer(activeSessionId, 'user', trimmed);

      try {
        const headers = await getAuthHeaders();
        const parsed = parseUserInput(trimmed);

        // Build conversation history from the last 6 messages (3 exchanges) so
        // the AI can answer follow-up questions in context. Excludes the welcome
        // message and the current user message (not yet in the session list).
        const currentSession = sessions.find((s) => s.id === activeSessionId);
        const recentMessages = (currentSession?.messages ?? [])
          .filter((m) => m.id !== 'welcome')
          .slice(-6)
          .map((m) => ({ role: m.speaker, content: m.text })) as Array<{ role: 'user' | 'wiz'; content: string }>;

        const response = await fetch(`${API_BASE}/api/gemini/behavior/decode`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            vocalDescription: parsed.vocalDescription,
            bodyLanguageSigns: parsed.bodySigns,
            context: parsed.context,
            conversationHistory: recentMessages.length > 0 ? recentMessages : undefined,
            catContext: catContext ?? undefined,
          }),
        });

        let wizText: string;
        let analysis: BehaviorDecodeResponse | undefined;
        let suggestedPrompts: string[] = [];

        if (response.ok) {
          const data = await response.json();
          
          // Handle clarifying response (vague prompt)
          // NOTE: don't bake "Try one of these:" into the text — suggestedPrompts
          // isn't persisted server-side, so a reload (tab switch, refresh, chat
          // reselect) would strip the chips while leaving behind a promise of
          // options that no longer exist. ChatWindow renders the label itself,
          // conditional on suggestedPrompts actually being present.
          if (data.type === 'clarifying') {
            wizText = data.question;
            suggestedPrompts = data.suggestedPrompts;
          }
          // Handle curiosity follow-up (structured-but-thin prompt)
          else if (data.type === 'followup') {
            wizText = data.question;
            suggestedPrompts = data.suggestedPrompts;
          }
          // Handle plain-text conversational reply (follow-up questions, validation requests)
          else if (data.type === 'conversational') {
            wizText = data.text;
            // No analysis card, no chips — just a direct answer
          }
          // Handle full analysis response
          else if (data.type === 'analysis') {
            analysis = data.analysis;
            wizText = formatAnalysisResponse(data.analysis);
          } else {
            // Fallback for older response format
            analysis = data;
            wizText = formatAnalysisResponse(data);
          }
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
          suggestedPrompts,
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
    [activeSessionId, isLoading, sessions]
  );

  // ─── Create new session ─────────────────────────────────────────────────────
  const createNewSession = useCallback(async () => {
    const newChat = await createChatOnServer(undefined, catId);
    if (newChat) {
      setSessions((prev) => [newChat, ...prev]);
      setActiveSessionId(newChat.id);
    } else {
      // Fallback to local
      const local = createLocalSession();
      setSessions((prev) => [local, ...prev]);
      setActiveSessionId(local.id);
    }
  }, [catId]);

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
 * Extracts vocal and body language hints from a free-form user message,
 * but always preserves the full original text as the primary vocal description
 * so the backend validator and AI receive complete context.
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

  const lowerText = text.toLowerCase();
  const detectedSigns = knownSigns.filter((s) => lowerText.includes(s));

  return {
    // Always send the full user text — never reduce to a single extracted keyword.
    // The backend validator uses word count and topic detection on the full sentence.
    vocalDescription: text,
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
