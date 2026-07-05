import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import wizMascot from '../../../../assets/Chat_Behavior_Icon.svg';
import { useBodyScrollLock } from '../../../../hooks/ui/useBodyScrollLock';
import { useDietAdvisorChat } from '../../../../hooks/features/useDietAdvisorChat';
import type { DietAdviceCatContext, DietChatMessage } from '../../../../hooks/features/useDietAdvisorChat';

interface DietAdvisorModalProps {
    isOpen: boolean;
    onClose: () => void;
    catContext: DietAdviceCatContext;
    /** When provided, auto-sends this question as soon as the modal opens */
    prefillQuestion?: string;
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

/** Renders **bold** markdown and bullet "• " lines from AI responses. */
function renderMessageText(text: string) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j} className="font-extrabold">{part.slice(2, -2)}</strong>
            ) : (
                part ? <span key={j}>{part}</span> : null
            )
        );

        if (line.startsWith('• ') || line.startsWith('- ')) {
            const bulletContent = line.slice(2);
            return (
                <div key={i} className="pl-1 flex items-start gap-2 mt-1">
                    <span className="text-[#30c290] font-black text-sm leading-none mt-0.5">•</span>
                    <span className="flex-1">{bulletContent}</span>
                </div>
            );
        }

        if (line === '') return <div key={i} className="h-2" />;

        return (
            <p key={i} className={i > 0 ? 'mt-0.5' : ''}>
                {rendered}
            </p>
        );
    });
}

// ─── Typewriter bubble: streams Wiz text letter-by-letter ─────────────────────
interface TypewriterBubbleProps {
    message: DietChatMessage;
    displayedLength: number;
    setDisplayedLength: (id: string, length: number) => void;
}

const TypewriterBubble: React.FC<TypewriterBubbleProps> = ({ message, displayedLength, setDisplayedLength }) => {
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
                <span className="inline-block w-[2px] h-[14px] bg-[#30c290] ml-0.5 align-middle animate-pulse" />
            )}
        </div>
    );
};

const ThinkingDots: React.FC = () => (
    <div className="flex items-end gap-2.5 animate-fadeInUp">
        <div className="w-8 h-8 rounded-full bg-[#30c290] flex-shrink-0 flex items-center justify-center mb-0.5 shadow-sm">
            <PawIcon className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1">
                <span className="text-[9px] font-black text-[#30c290] uppercase tracking-wider mr-2">Thinking</span>
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#30c290] inline-block"
                        style={{ animation: 'thinkingBounce 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                    />
                ))}
            </div>
        </div>
    </div>
);

const SUGGESTED_QUESTIONS = [
    "Why is my cat's calorie target this amount?",
    'Can I switch to wet food?',
    'Is my cat drinking enough water today?',
    'How should I split meals throughout the day?',
];

export const DietAdvisorModal: React.FC<DietAdvisorModalProps> = ({ isOpen, onClose, catContext, prefillQuestion }) => {
    useBodyScrollLock(isOpen);
    const { messages, inputValue, setInputValue, isLoading, sendMessage } = useDietAdvisorChat(catContext);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasSentPrefillRef = useRef(false);

    // Tracks how many characters have been revealed per message during typewriter animation.
    const [typewriterState, setTypewriterState] = useState<Record<string, number>>({});
    // Persists IDs of messages whose typewriter animation has fully completed —
    // once in this set a message always renders statically, surviving re-renders.
    const completedMessageIds = useRef<Set<string>>(new Set());
    // The welcome message is present on mount — it should never typewrite.
    const initialMessageIdsRef = useRef<Set<string>>(new Set(messages.map((m) => m.id)));

    const setDisplayedLength = useCallback((messageId: string, length: number) => {
        const fullLength = messages.find((m) => m.id === messageId)?.text.length || 0;
        const clamped = Math.min(length, fullLength);
        if (clamped >= fullLength) {
            completedMessageIds.current.add(messageId);
        }
        setTypewriterState((prev) => ({ ...prev, [messageId]: clamped }));
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, isLoading]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => inputRef.current?.focus(), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Auto-send a prefill question when the modal opens with one
    useEffect(() => {
        if (isOpen && prefillQuestion && !hasSentPrefillRef.current) {
            hasSentPrefillRef.current = true;
            // Small delay so the modal animation finishes before the message appears
            const timer = setTimeout(() => sendMessage(prefillQuestion), 500);
            return () => clearTimeout(timer);
        }
        if (!isOpen) {
            hasSentPrefillRef.current = false;
        }
    }, [isOpen, prefillQuestion, sendMessage]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) sendMessage(inputValue);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />

                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                            className="bg-white border-2 border-slate-900 rounded-[2rem] max-w-lg w-full shadow-[6px_6px_0_0_rgba(15,23,42,1)] pointer-events-auto max-h-[85vh] flex flex-col overflow-hidden"
                        >
                            <style>{`
                                @keyframes thinkingBounce {
                                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                                    30% { transform: translateY(-4px); opacity: 1; }
                                }
                                .scrollbar-custom::-webkit-scrollbar { width: 6px; }
                                .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
                                .scrollbar-custom::-webkit-scrollbar-thumb { background: #30c290; border-radius: 8px; }
                                .scrollbar-custom { scrollbar-color: #30c290 transparent; scrollbar-width: thin; }
                            `}</style>

                            {/* Header — same Wiz profile treatment as Behavior Chat's ChatWindow */}
                            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b-2 border-slate-900 bg-gradient-to-r from-[#15AFB4] to-[#1bc5c5] flex-shrink-0">
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
                                        Diet Advisor · {catContext.catName}'s Profile
                                    </p>
                                </div>

                                {/* Status badge */}
                                <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 text-[#2ec4b6] border border-[#2ec4b6]/30 rounded-lg px-2.5 py-1.5 shadow-[0_0_12px_rgba(46,196,182,0.15)]">
                                    <PawIcon className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black tracking-wider uppercase">ONLINE</span>
                                </div>

                                <button
                                    onClick={onClose}
                                    aria-label="Close diet advisor chat"
                                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
                                >
                                    <X size={16} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-slate-50/40 scrollbar-custom min-h-[320px]">
                                {messages.map((msg) => {
                                    const isWiz = msg.speaker === 'wiz';
                                    // Typewrite only new Wiz messages that weren't present on mount
                                    // and haven't already finished animating this session.
                                    const isNewMessage = !initialMessageIdsRef.current.has(msg.id);
                                    const isCompleted = completedMessageIds.current.has(msg.id);
                                    const shouldTypewrite = isWiz && isNewMessage && !isCompleted;
                                    const displayedLen = shouldTypewrite
                                        ? (typewriterState[msg.id] ?? 0)
                                        : msg.text.length;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex items-end gap-2.5 animate-fadeInUp ${msg.speaker === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {isWiz ? (
                                                <div className="w-8 h-8 rounded-full bg-[#30c290] flex-shrink-0 flex items-center justify-center mb-0.5 shadow-sm">
                                                    <PawIcon className="w-4.5 h-4.5 text-white" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center mb-0.5 text-sm">
                                                    🧑
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[78%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm ${
                                                    isWiz
                                                        ? 'bg-white border border-slate-200/80 text-slate-700 rounded-bl-sm'
                                                        : 'bg-[#FFB870] text-slate-900 rounded-br-sm border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]'
                                                }`}
                                            >
                                                {isWiz && (
                                                    <span className="text-[9px] font-black text-[#30c290] uppercase tracking-wider block mb-1">
                                                        Wiz · Diet Advisor
                                                    </span>
                                                )}
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
                                    );
                                })}

                                {/* Suggested questions — only shown before the user asks anything */}
                                {messages.length === 1 && !isLoading && (
                                    <div className="ml-10 mt-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                            Try asking:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {SUGGESTED_QUESTIONS.map((q, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => sendMessage(q)}
                                                    className="px-3.5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border-2 cursor-pointer active:scale-95 bg-[#30c290]/10 border-[#30c290]/40 text-slate-700 hover:bg-[#30c290]/20 hover:border-[#30c290]/60 shadow-sm"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {isLoading && <ThinkingDots />}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSubmit} className="px-5 py-4 border-t-2 border-slate-200 bg-white flex-shrink-0">
                                <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-[#30c290] focus-within:ring-2 focus-within:ring-[#30c290]/20 transition-all">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={`Ask about ${catContext.catName}'s diet...`}
                                        className="flex-1 bg-transparent text-sm text-slate-700 font-medium placeholder-slate-400 outline-none min-w-0"
                                        disabled={isLoading}
                                    />
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
                                        <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold mt-2 text-center">
                                    Answers are grounded in {catContext.catName}'s current diet profile. Not a substitute for veterinary advice.
                                </p>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DietAdvisorModal;
