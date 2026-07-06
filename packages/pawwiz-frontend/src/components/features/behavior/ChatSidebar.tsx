import React from 'react';
import type { ChatSession } from '../../../hooks/features/useBehaviorChat';

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  /** Session ID whose title is being fetched from the backend — shows shimmer. */
  titleLoadingSessionId?: string | null;
}

// ─── Skeleton Components ─────────────────────────────────────────────────────
const SkeletonSession: React.FC<{ index: number }> = ({ index }) => (
  <div
    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-transparent"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="w-6 h-6 rounded-full bg-white/15 animate-pulse flex-shrink-0" />
    <div className="flex-1 h-3 bg-white/15 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
  </div>
);

const SkeletonSidebar: React.FC = () => (
  <div className="space-y-1">
    {[0, 1, 2, 3, 4].map((i) => (
      <SkeletonSession key={i} index={i} />
    ))}
  </div>
);

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onToggle,
  isLoading = false,
  titleLoadingSessionId = null,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed md:relative z-50 md:z-auto
          top-0 left-0 h-full md:h-auto
          w-[260px] md:w-[240px] lg:w-[280px]
          flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-[#15AFB4] to-[#0e9096] rounded-none md:rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-4 border-b border-white/15">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Chats
              </h2>
              <button
                onClick={onNewChat}
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-95"
                aria-label="New chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-sidebar">
            {isLoading ? (
              <SkeletonSidebar />
            ) : (
              <>
                {sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        isActive
                          ? 'bg-white/20 shadow-sm border border-white/20'
                          : 'hover:bg-white/10 border border-transparent'
                      }`}
                      onClick={() => onSelectSession(session.id)}
                    >
                      {/* Chat icon */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-[#FFB870]' : 'bg-white/15'
                      }`}>
                        <svg className={`w-3 h-3 ${isActive ? 'text-slate-900' : 'text-white/80'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z" />
                        </svg>
                      </div>

                      {/* Title — shimmer while backend title is loading */}
                      {titleLoadingSessionId === session.id ? (
                        <span className="flex-1 h-3 rounded-full bg-white/30 animate-pulse" />
                      ) : (
                        <span className={`text-xs font-bold truncate flex-1 ${
                          isActive ? 'text-white' : 'text-white/75'
                        }`}>
                          {session.title}
                        </span>
                      )}

                      {/* Options / delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-white/50 hover:text-red-300 hover:bg-white/10 transition-all cursor-pointer"
                        aria-label={`Delete ${session.title}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/15">
            <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider text-center">
              {isLoading ? 'Loading...' : `${sessions.length} conversation${sessions.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </aside>
      
      {/* Scrollbar styles for sidebar */}
      <style>{`
        .scrollbar-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .scrollbar-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 9999px;
        }
        .scrollbar-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .scrollbar-sidebar::-webkit-scrollbar-button {
          display: none;
        }
        
        /* Firefox scrollbar */
        .scrollbar-sidebar {
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
          scrollbar-width: thin;
        }
      `}</style>
    </>
  );
};

export default ChatSidebar;
