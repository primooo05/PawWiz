import React from 'react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  isLoading?: boolean;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onSelect, isLoading = false }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 animate-fadeInUp">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          disabled={isLoading}
          className={`px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border-2 cursor-pointer active:scale-95 ${
            isLoading
              ? 'opacity-50 pointer-events-none'
              : 'bg-gradient-to-r from-[#2ec4b6]/10 to-[#FFB870]/10 border-[#2ec4b6]/40 text-slate-700 hover:bg-gradient-to-r hover:from-[#2ec4b6]/20 hover:to-[#FFB870]/20 hover:border-[#2ec4b6]/60 shadow-sm'
          }`}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SuggestionChips;
