import React, { useState, useEffect, useRef } from 'react';

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  active?: boolean;
  loading?: boolean;
  onSearchChange?: (query: string) => void;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  value,
  onChange,
  placeholder,
  options,
  disabled = false,
  active = true,
  loading = false,
  onSearchChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(value);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
    setIsOpen(true);
  };

  const handleFocus = () => {
    if (!disabled && active) {
      setIsOpen(true);
    }
  };

  const handleSelectOption = (option: string) => {
    onChange(option);
    setSearchTerm(option);
    setIsOpen(false);
  };

  const filteredOptions = onSearchChange 
    ? options 
    : (searchTerm === value || !searchTerm
        ? options 
        : options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled || !active}
        className="w-full px-5 py-3.5 min-h-[44px] bg-[#2ec4b6] text-white font-semibold placeholder:text-teal-100/70 placeholder:font-medium rounded-2xl border-2 border-slate-900 outline-none transition-all shadow-[4px_4px_0_0_rgba(15,23,42,0.2)] focus:ring-2 focus:ring-[#e9c46a] focus:shadow-[4px_4px_0_0_rgba(15,23,42,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
      />
      
      {isOpen && (active || options.length > 0) && (
        <div className="absolute z-30 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-teal-600">
          {loading ? (
            <div className="px-5 py-3.5 text-slate-400 text-sm italic">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div 
              className="px-5 py-3.5 text-slate-600 text-sm font-semibold cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => handleSelectOption(searchTerm)}
            >
              Add "{searchTerm}"
            </div>
          ) : (
            filteredOptions.slice(0, 10).map((opt, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="px-5 py-3 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-b-0"
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
