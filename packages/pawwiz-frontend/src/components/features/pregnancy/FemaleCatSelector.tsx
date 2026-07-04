import React from 'react';

export interface FemaleCatOption {
  id: string;
  name: string;
  photoUrl: string | null;
}

interface FemaleCatSelectorProps {
  cats: FemaleCatOption[];
  onSelect: (id: string) => void;
}

/**
 * Lets an owner with multiple female cats choose which one is pregnant before
 * entering the pregnancy tracker.
 */
const FemaleCatSelector: React.FC<FemaleCatSelectorProps> = ({ cats, onSelect }) => {
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">🐈</div>
        <h2 className="text-2xl md:text-3xl font-black tracking-wide">WHICH CAT IS PREGNANT?</h2>
        <p className="text-sm font-bold text-[#555] mt-2">
          Select the female cat you want to track.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {cats.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="group flex items-center gap-4 bg-white border-4 border-[#1a1a1a] rounded-3xl p-5 text-left hover:shadow-[6px_6px_0_0_#1a1a1a] hover:-translate-y-1 transition-all"
          >
            <div className="w-16 h-16 flex-shrink-0 rounded-2xl border-3 border-[#1a1a1a] overflow-hidden bg-[#FFE0E0] flex items-center justify-center">
              {cat.photoUrl ? (
                <img src={cat.photoUrl} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl" aria-hidden="true">🐱</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-black text-lg truncate">{cat.name}</p>
              <p className="text-xs font-bold text-[#888] uppercase tracking-widest">Female</p>
            </div>
            <span className="ml-auto text-xs font-black text-[#F98080] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Select →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FemaleCatSelector;
