import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBehaviorChat } from '../../../hooks/features/useBehaviorChat';
import { useDietRecommender } from '../../../hooks/features/useDietRecommender';
import { useProfilePanel } from '../../../hooks/features/useProfilePanel';
import { getTimeGreeting } from '../../../utils/greeting';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import CatProfilePanel from './CatProfilePanel';
import BottomNav from '../../layout/BottomNav';
import GreetingHeader from '../../layout/GreetingHeader';

export const BehaviorChat: React.FC = () => {
  const navigate = useNavigate();

  const { profiles, activeProfileId, switchProfile } = useDietRecommender();
  const { profile } = useProfilePanel();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Cat profile selection — resolved before the hook so catId is stable ───
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const effectiveCatId = selectedCatId || activeProfileId;
  const selectedCat = profiles.find((p) => p.id === effectiveCatId) ?? profiles[0];

  // The Cat DB id (from cats table) — used to scope behavior chats per cat.
  // Pass `undefined` while profiles are still loading to prevent premature
  // chat fetches that would query with catId=null and create orphaned sessions.
  const profilesReady = profiles.length > 0;
  const selectedCatDbId = profilesReady ? (selectedCat?.catId ?? null) : undefined;

  const {
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
    titleLoadingSessionId,
  } = useBehaviorChat(selectedCatDbId);

  // Build a BehaviorCatContext snapshot from the selected diet profile
  const catContext = selectedCat
    ? {
        name: selectedCat.name,
        sex: selectedCat.gender,
        lifeStage: selectedCat.lifeStage,
        breed: selectedCat.breed ?? null,
        age: selectedCat.age,
        catId: selectedCatDbId,
      }
    : undefined;

  const catName = selectedCat?.name ?? 'your cat';

  const handleSwitchCat = (id: string) => {
    setSelectedCatId(id);
    switchProfile(id); // keep diet recommender in sync
  };

  const behaviorGreeting = getTimeGreeting(
    {
      morning: (owner, cat) => ({
        title: `Good morning, ${owner}!`,
        subtitle: `What's ${cat} up to this morning?`,
      }),
      midday: (owner, cat) => ({
        title: `Hi ${owner}!`,
        subtitle: `Let's decode ${cat}'s behavior today`,
      }),
      evening: (owner, cat) => ({
        title: `Good evening, ${owner}.`,
        subtitle: `Any behavior from ${cat} worth reviewing today?`,
      }),
      night: (owner, cat) => ({
        title: `Hello, ${owner}!`,
        subtitle: `Chat about ${cat}'s behavior anytime`,
      }),
    },
    profile?.displayName,
    catName
  );

  const avatarDataList = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    src: p.photoUrl || undefined,
    alt: p.name,
    isActive: p.id === effectiveCatId,
    isNew: !p.isTracking,
  }));

  const handleNavigation = (item: string) => {
    if (item === 'calendar') navigate('/pregnancy-tracker');
    else if (item === 'dashboard') navigate('/dashboard');
    else if (item === 'diet-reco') navigate('/diet-recommender');
    else if (item === 'settings') navigate('/settings');
    else if (item === 'behavior') navigate('/behavior-chat');
  };

  const handleExampleClick = (exampleText: string) => {
    setInputValue(exampleText);
  };

  // Wrap sendMessage to always inject the current cat context
  const handleSend = (text: string) => {
    sendMessage(text, catContext);
  };

  // Show skeleton while sessions are being fetched from backend
  const isInitialLoading = !isInitialized || !activeSession;

  return (
    <div className="h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col overflow-hidden md:overflow-y-auto">
      {/* Greeting Header */}
      <div className="w-full md:w-[1620px] md:mx-auto px-4 sm:px-6 pt-8 pb-2">
        <GreetingHeader
          title={behaviorGreeting.title}
          subtitle={behaviorGreeting.subtitle}
          avatars={avatarDataList}
          onAvatarClick={(id) => handleSwitchCat(id)}
        />
      </div>

      {/* Main 3-panel layout */}
      <div className="flex flex-1 w-full md:w-[1620px] md:mx-auto px-2 sm:px-4 py-4 gap-3 min-h-0 pb-10 md:pb-26">
        {/* Left Panel: Chat Sidebar */}
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewChat={createNewSession}
          onDeleteSession={deleteSession}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isLoading={isInitialLoading}
          titleLoadingSessionId={titleLoadingSessionId}
        />

        {/* Center Panel: Chat Window */}
        <ChatWindow
          messages={activeSession?.messages ?? []}
          isLoading={isLoading}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isInitialLoading={isInitialLoading}
        />

        {/* Right Panel: Cat Profile + Actions */}
        <CatProfilePanel
          activeSession={activeSession}
          onDeleteChat={() => deleteSession(activeSessionId)}
          onExampleClick={handleExampleClick}
          catName={catName}
          profiles={profiles}
          selectedCatId={effectiveCatId}
          onSwitchCat={handleSwitchCat}
        />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-3 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
        <BottomNav
          activeItem="behavior"
          onItemClick={handleNavigation}
          className="w-full max-w-2xl md:w-auto md:scale-110"
          hasUntracked={profiles.some(p => !p.isTracking)}
        />
      </div>
    </div>
  );
};

export default BehaviorChat;
