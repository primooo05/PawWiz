import React, { useState, useEffect } from 'react';
import { Cat } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';
import type { ChatSession } from '../../hooks/useBehaviorChat';

interface CatProfilePanelProps {
  activeSession: ChatSession | null | undefined;
  onDeleteChat: () => void;
  onExampleClick: (text: string) => void;
  catName?: string;
}

interface CatProfileData {
  name: string;
  gender: 'male' | 'female';
  lifeStage: 'kitten' | 'adult' | 'senior';
  age: number;
  weight: number;
  isKg: boolean;
  photoUrl?: string | null;
  breed?: string | null;
}

const CatProfilePanel: React.FC<CatProfilePanelProps> = ({
  activeSession,
  onDeleteChat,
  onExampleClick,
  catName,
}) => {
  const [profile, setProfile] = useState<CatProfileData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isLoading = !activeSession;

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch diet profiles which contain the full cat data (weight, age, etc.)
        const dietRes = await fetch(`${API_BASE}/api/diet/profiles`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (dietRes.ok && active) {
          const data = await dietRes.json();
          if (data && data.length > 0) {
            const first = data[0];
            setProfile({
              name: first.name || first.catName || 'My Cat',
              gender: first.gender || 'male',
              lifeStage: first.lifeStage || 'adult',
              age: first.age || 0,
              weight: first.weight || 0,
              isKg: first.isKg ?? true,
              photoUrl: first.photoUrl || null,
              breed: first.breed || null,
            });
            return;
          }
        }

        // Fallback: fetch the primary profile for basic cat info
        const profileRes = await fetch(`${API_BASE}/api/profile`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (profileRes.ok && active) {
          const data = await profileRes.json();
          if (data && data.catName) {
            setProfile({
              name: data.catName,
              gender: data.catSex?.toLowerCase() === 'female' ? 'female' : 'male',
              lifeStage: data.catLifeStage?.toLowerCase() === 'senior'
                ? 'senior'
                : data.catLifeStage?.toLowerCase() === 'kitten'
                  ? 'kitten'
                  : 'adult',
              age: 0,
              weight: 0,
              isKg: true,
              photoUrl: null,
              breed: data.catBreed || null,
            });
          }
        }
      } catch {
        // Silently fail — profile panel is supplementary
      }
    };

    loadProfile();
    return () => { active = false; };
  }, []);

  const messageCount = activeSession?.messages.filter((m) => m.speaker === 'user').length ?? 0;
  const analysisCount = activeSession?.messages.filter((m) => m.analysis).length ?? 0;

  return (
    <aside className="hidden lg:flex w-[280px] xl:w-[300px] flex-shrink-0 flex-col gap-3 overflow-hidden">
      <style>{`
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
      {/* Cat Profile Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] p-5 flex flex-col items-center">
        {/* Avatar */}
        <div className="w-16 h-16 bg-teal-50 border-3 border-[#2ec4b6] rounded-full flex items-center justify-center overflow-hidden mb-3 shadow-sm text-[#2ec4b6]">
          {profile?.photoUrl ? (
            <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <Cat size={32} className="stroke-[1.5]" />
          )}
        </div>

        {/* Name badge */}
        {isLoading ? (
          <>
            <div className="h-5 w-20 bg-slate-200 rounded-full animate-pulse mb-3" />
            <div className="flex flex-wrap justify-center gap-1.5 w-full">
              <div className="h-5 w-12 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-5 w-10 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </>
        ) : profile ? (
          <>
            <span className="bg-[#2ec4b6] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-3">
              {profile.name}
            </span>

            {/* Info chips */}
            <div className="flex flex-wrap justify-center gap-1.5 w-full">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border-2 border-slate-900 shadow-[1px_1px_0_0_rgba(15,23,42,1)] ${
                profile.gender === 'female' ? 'bg-[#ff9ebb]' : 'bg-[#5ce1e6]'
              } text-slate-900 uppercase`}>
                {profile.gender}
              </span>
              {profile.age > 0 && (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg border-2 border-slate-900 shadow-[1px_1px_0_0_rgba(15,23,42,1)] bg-[#FFB870] text-slate-900 uppercase">
                  {profile.age} {profile.lifeStage === 'kitten' ? 'mo' : 'yr'}
                </span>
              )}
              {profile.weight > 0 && (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg border-2 border-slate-900 shadow-[1px_1px_0_0_rgba(15,23,42,1)] bg-white text-slate-900">
                  {profile.weight.toFixed(1)} {profile.isKg ? 'kg' : 'lbs'}
                </span>
              )}
            </div>
          </>
        ) : (
          <span className="text-xs font-bold text-slate-400">Loading profile...</span>
        )}
      </div>

      {/* Session Stats */}
      <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] p-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">
          Session Info
        </h3>

        {isLoading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Messages</span>
              <div className="h-4 w-8 bg-slate-200 rounded-md animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Analyses</span>
              <div className="h-4 w-8 bg-slate-200 rounded-md animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Started</span>
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Messages</span>
              <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                {messageCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Analyses</span>
              <span className="text-xs font-black text-[#2ec4b6] bg-[#2ec4b6]/10 px-2 py-0.5 rounded-md">
                {analysisCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Started</span>
              <span className="text-[10px] font-bold text-slate-600">
                {activeSession?.createdAt?.toLocaleDateString() ?? '-'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-br from-[#2ec4b6]/5 to-[#2ec4b6]/10 rounded-2xl border-2 border-[#2ec4b6]/30 p-4">
        <h3 className="text-[10px] font-black text-[#2ec4b6] uppercase tracking-wider mb-2">
          💡 Quick Tips
        </h3>
        <ul className="space-y-1.5 text-[10px] text-slate-600 font-medium">
          <li className="flex items-start gap-1.5">
            <span className="text-[#2ec4b6]">•</span>
            Mention specific sounds: hiss, chirp, trill
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-[#2ec4b6]">•</span>
            Describe body posture: tail, ears, eyes
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-[#2ec4b6]">•</span>
            Add context: time of day, triggers
          </li>
        </ul>
      </div>

      {/* Divider */}
      <div className="border-t border-[#2ec4b6]/20 pt-3">
        <h3 className="text-[10px] font-black text-[#2ec4b6] uppercase tracking-wider mb-2">
          ✏️ Try this example
        </h3>
        <button
          type="button"
          disabled={isLoading}
          onClick={() =>
            onExampleClick(
              `Every night around 2 AM, ${catName ?? 'my cat'} suddenly sprints around the house, makes a loud trill, and her tail is fully puffed. It lasts about 10 minutes then she's completely calm. What's happening?`
            )
          }
          className={`w-full text-left bg-white/60 hover:bg-white border border-[#2ec4b6]/20 hover:border-[#2ec4b6]/60 rounded-xl px-3 py-2.5 transition-all group cursor-pointer ${
            isLoading ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <p className="text-[10px] text-slate-500 leading-relaxed italic group-hover:text-slate-700 transition-colors">
            "Every night around 2 AM,{' '}
            <span className="font-semibold not-italic text-[#2ec4b6]">
              {catName ?? 'my cat'}
            </span>{' '}
            suddenly sprints around the house, makes a loud trill, and her tail is fully puffed. It lasts about 10 minutes then she's completely calm. What's happening?"
          </p>
          <p className="text-[10px] text-[#2ec4b6] font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to use this example →
          </p>
        </button>
      </div>

      {/* Delete Chat */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={isLoading}
        className={`mt-6 w-full py-2.5 rounded-xl bg-red-50 border-2 border-red-200 text-red-500 text-xs font-black uppercase tracking-wider hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer active:scale-[0.98] ${
          isLoading ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        Delete Chat
      </button>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full mx-4 border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] animate-scaleUp">
            <h4 className="text-sm font-black text-slate-900 mb-2">Delete this chat?</h4>
            <p className="text-xs text-slate-500 mb-5">
              This will permanently remove the conversation and all behavior analyses in it.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-xl border-2 border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteChat();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2 rounded-xl bg-red-500 border-2 border-red-600 text-xs font-black text-white hover:bg-red-600 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default CatProfilePanel;
