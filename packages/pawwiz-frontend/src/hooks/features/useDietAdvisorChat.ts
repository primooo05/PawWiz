import { useCallback, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';

export interface DietChatMessage {
    id: string;
    speaker: 'wiz' | 'user';
    text: string;
    timestamp: Date;
}

/** Snapshot of the cat's current diet profile — sent as grounding context for every question. */
export interface DietAdviceCatContext {
    catName: string;
    gender: 'male' | 'female';
    lifeStage: 'kitten' | 'adult' | 'senior';
    age: number;
    weight: number;
    isKg: boolean;
    foodPreference: 'dry' | 'wet' | 'mixed';
    isSpayedNeutered: boolean;
    dailyCalories: number;
    totalLoggedCalories: number;
    waterIntake: number;
    waterTarget: number;
    mealsLoggedToday: number;
    mealsPendingToday: number;
}

const buildWelcomeMessage = (catName: string): DietChatMessage => ({
    id: 'welcome',
    speaker: 'wiz',
    text: `Hey! 👋 I'm Wiz. I've got ${catName}'s diet profile pulled up — ask me anything about ${catName}'s calorie target, feeding schedule, food switches, or hydration.`,
    timestamp: new Date(),
});

/**
 * Manages a lightweight, in-memory conversation with the Diet Advisor AI.
 * Grounded in the cat's current diet profile snapshot (weight, calories, water,
 * meals logged) rather than a persisted chat history — this is a quick Q&A
 * companion for the diet dashboard, not a full session-based chat like Behavior Chat.
 */
export function useDietAdvisorChat(catContext: DietAdviceCatContext) {
    const [messages, setMessages] = useState<DietChatMessage[]>(() => [
        buildWelcomeMessage(catContext.catName),
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const msgIdCounter = useRef(1);

    const generateLocalId = () => `diet-advice-${Date.now()}-${msgIdCounter.current++}`;

    const getAuthHeaders = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token || ''}`,
        };
    };

    const resetConversation = useCallback(() => {
        setMessages([buildWelcomeMessage(catContext.catName)]);
    }, [catContext.catName]);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || isLoading) return;
            const trimmed = text.trim();

            const userMsg: DietChatMessage = {
                id: generateLocalId(),
                speaker: 'user',
                text: trimmed,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setInputValue('');
            setIsLoading(true);

            try {
                const headers = await getAuthHeaders();

                // Build conversation history from the last 6 messages (3 exchanges),
                // excluding the welcome message and the message just sent.
                const recentMessages = messages
                    .filter((m) => m.id !== 'welcome')
                    .slice(-6)
                    .map((m) => ({ role: m.speaker, content: m.text }));

                const response = await fetch(`${API_BASE}/api/gemini/diet/advice`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        question: trimmed,
                        catProfile: catContext,
                        conversationHistory: recentMessages.length > 0 ? recentMessages : undefined,
                    }),
                });

                let wizText: string;
                if (response.ok) {
                    const data = await response.json();
                    wizText =
                        data.text ||
                        "I couldn't come up with an answer just now. Could you rephrase your question?";
                } else {
                    wizText = "I couldn't reach the diet advisor right now. Please try again in a moment.";
                }

                const wizMsg: DietChatMessage = {
                    id: generateLocalId(),
                    speaker: 'wiz',
                    text: wizText,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, wizMsg]);
            } catch {
                const errorMsg: DietChatMessage = {
                    id: generateLocalId(),
                    speaker: 'wiz',
                    text: "Something went wrong on my end. Try again in a moment — I'll be ready! 🐾",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMsg]);
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, messages, catContext]
    );

    return {
        messages,
        inputValue,
        setInputValue,
        isLoading,
        sendMessage,
        resetConversation,
    };
}
