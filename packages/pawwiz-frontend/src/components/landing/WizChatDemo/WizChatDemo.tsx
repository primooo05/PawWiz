import { useState, useEffect, useRef } from "react";
import type { Speaker, MsgBubble } from "./types";
import { SCRIPT } from "./constants";
import "./WizChatDemo.css";

const PawIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="6.5"  cy="11.5" r="2" />
    <circle cx="10"   cy="7.5"  r="2" />
    <circle cx="14"   cy="7.5"  r="2" />
    <circle cx="17.5" cy="11.5" r="2" />
    <path d="M7.5 17c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4c0 1.5-1.5 2.5-4.5 2.5s-4.5-1-4.5-2.5z" />
  </svg>
);

const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-4 py-2.5">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-slate-400 inline-block"
        style={{
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
  </div>
);

export default function WizChatDemo() {
  const [messages, setMessages] = useState<MsgBubble[]>([]);
  const [typingFor, setTypingFor] = useState<Speaker | null>(null);
  const [inputText, setInputText] = useState("");
  const [inputTyping, setInputTyping] = useState(false);

  const msgIdRef = useRef(0);

  // Animation engine
  useEffect(() => {
    let active = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const sleep = (ms: number) =>
      new Promise<void>((res) => { const t = setTimeout(res, ms); timers.push(t); });

    const typeIntoInput = async (text: string) => {
      setInputTyping(true);
      for (let i = 1; i <= text.length; i++) {
        if (!active) return;
        setInputText(text.slice(0, i));
        await sleep(45 + Math.random() * 30);
      }
      await sleep(400);
    };

    const clearInput = () => {
      setInputText("");
      setInputTyping(false);
    };

    const pushMessage = (speaker: Speaker, text: string) => {
      const id = ++msgIdRef.current;
      setMessages((prev) => [...prev, { speaker, text, id }]);
    };

    const runScript = async () => {
      if (!active) return;

      // Reset
      setMessages([]);
      setTypingFor(null);
      setInputText("");
      setInputTyping(false);
      msgIdRef.current = 0;

      await sleep(800);
      if (!active) return;

      for (const line of SCRIPT) {
        if (!active) return;

        await sleep(line.pauseBefore);
        if (!active) return;

        if (line.speaker === "user") {
          await typeIntoInput(line.text);
          if (!active) return;
          clearInput();
          pushMessage("user", line.text);
          await sleep(200);
        } else {
          setTypingFor("wiz");
          await sleep(line.typingDuration);
          if (!active) return;
          setTypingFor(null);
          pushMessage("wiz", line.text);
          await sleep(300);
        }
      }

      await sleep(5000);
      if (active) runScript();
    };

    runScript();
    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Ambient glows */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#e9c46a]/12 rounded-full filter blur-3xl pointer-events-none -z-10" />
      <div className="absolute -left-12 -top-12 w-52 h-52 bg-[#2ec4b6]/10 rounded-full filter blur-3xl pointer-events-none -z-10" />

      {/* Card: rectangular modern card */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_24px_64px_-8px_rgba(0,0,0,0.09)] flex flex-col overflow-hidden">

        {/* ─ Chat header ─ */}
        <div className="flex items-center gap-4 px-6 py-4.5 border-b border-slate-100 bg-white">
          {/* Wiz avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-[#2ec4b6] flex items-center justify-center shadow-sm">
              <PawIcon className="w-6 h-6 text-white" />
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-black text-slate-900 tracking-tight leading-none">Wiz</p>
            <p className="text-[11px] text-[#2ec4b6] font-bold mt-1">Virtual Mascot Doctor · PawWiz AI</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 text-[#2ec4b6] border border-[#2ec4b6]/30 rounded-md px-2.5 py-1 shadow-[0_0_12px_rgba(46,196,182,0.15)] select-none">
            <svg className="w-6 h-3 text-[#2ec4b6] overflow-visible" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path className="ekg-line" d="M0 6h3.5l1.5-4.5 2 9 2.5-6.5 1.5 2 4-0.5h9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[9px] font-black font-mono tracking-wider uppercase leading-none">
              DIAGNOSTIC SIM
            </span>
          </div>
        </div>

        {/* ─ Messages area: wider and shorter for horizontal rectangular aspect ─ */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 min-h-[380px] max-h-[420px] bg-slate-50/50">

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-3 diet-msg-in ${msg.speaker === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              {msg.speaker === "wiz" ? (
                <div className="w-8.5 h-8.5 rounded-full bg-[#2ec4b6] flex-shrink-0 flex items-center justify-center mb-0.5">
                  <PawIcon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-8.5 h-8.5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center mb-0.5 text-base">
                  🧑
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[80%] px-4.5 py-3 rounded-2xl text-sm leading-relaxed font-medium shadow-sm text-left ${
                  msg.speaker === "wiz"
                    ? "bg-white border border-slate-200/80 text-slate-700 rounded-bl-sm"
                    : "bg-[#e9c46a] text-slate-900 rounded-br-sm"
                }`}
              >
                {msg.speaker === "wiz" && (
                  <span className="text-[10px] font-black text-[#2ec4b6] uppercase tracking-wider block mb-1">Wiz · AI</span>
                )}
                {msg.text}
              </div>
            </div>
          ))}

          {/* Wiz typing indicator */}
          {typingFor === "wiz" && (
            <div className="flex items-end gap-3 diet-msg-in">
              <div className="w-8.5 h-8.5 rounded-full bg-[#2ec4b6] flex-shrink-0 flex items-center justify-center mb-0.5">
                <PawIcon className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-sm shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {/* ─ Input bar ─ */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-3">
            {/* Mic / attachment icon */}
            <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>

            {/* Typed text + blinking cursor */}
            <div className="flex-1 text-sm text-slate-600 font-medium min-w-0 truncate text-left">
              {inputText ? (
                <span>
                  {inputText}
                  {inputTyping && <span className="diet-cursor text-slate-400">|</span>}
                </span>
              ) : (
                <span className="text-slate-400">Ask Wiz about your cat…</span>
              )}
            </div>

            {/* Send button */}
            <button
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                inputText
                  ? "bg-[#e9c46a] shadow-sm scale-100"
                  : "bg-slate-200 scale-95 opacity-60"
              }`}
              tabIndex={-1}
            >
              <svg className="w-4.5 h-4.5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
