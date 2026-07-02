import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBehaviorChat } from '../../hooks/useBehaviorChat';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import CatProfilePanel from './CatProfilePanel';
import BottomNav from '../BottomNav';

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigation = (item: string) => {
    if (item === 'calendar') navigate('/pregnancy-tracker');
    else if (item === 'dashboard') navigate('/dashboard');
    else if (item === 'diet-reco') navigate('/diet-recommender');
    else if (item === 'settings') navigate('/settings');
    else if (item === 'behavior') navigate('/behavior');
  };

  const handleExampleClick = (exampleText: string) => {
    setInputValue(exampleText);
  };

  // Show skeleton while sessions are being fetched from backend
  const isInitialLoading = !isInitialized || !activeSession;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
      {/* Main 3-panel layout */}
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto px-2 sm:px-4 py-4 gap-3 min-h-[calc(100vh-120px)]">
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
      <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
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
