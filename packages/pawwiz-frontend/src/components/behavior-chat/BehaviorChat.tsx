import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBehaviorChat } from '../../hooks/useBehaviorChat';
import { useDietRecommender } from '../../hooks/useDietRecommender';
import { useProfilePanel } from '../../hooks/useProfilePanel';
import { getTimeGreeting } from '../../utils/greeting';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import CatProfilePanel from './CatProfilePanel';
import BottomNav from '../BottomNav';
import GreetingHeader from '../GreetingHeader';

export const BehaviorChat: React.FC = () => {
  const navigate = useNavigate();
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
  } = useBehaviorChat();

  const { profiles, activeProfileId, switchProfile, catName } = useDietRecommender();
  const { profile } = useProfilePanel();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    isActive: p.id === activeProfileId,
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
          onAvatarClick={(id) => switchProfile(id)}
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
        />

        {/* Center Panel: Chat Window */}
        <ChatWindow
          messages={activeSession?.messages ?? []}
          isLoading={isLoading}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={sendMessage}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isInitialLoading={isInitialLoading}
        />

        {/* Right Panel: Cat Profile + Actions */}
        <CatProfilePanel
          activeSession={activeSession}
          onDeleteChat={() => deleteSession(activeSessionId)}
          onExampleClick={handleExampleClick}
          catName="your cat"
        />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-3 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
        <BottomNav
          activeItem="behavior"
          onItemClick={handleNavigation}
          className="w-full max-w-2xl md:w-auto md:scale-110"
        />
      </div>
    </div>
  );
};

export default BehaviorChat;
