import React from 'react';

interface FemaleOnlyModalProps {
  onClose: () => void;
}

/**
 * Blocking modal shown when an owner without any female cat tries to open the
 * pregnancy tracker. Pregnancy features are only available for female cats.
 */
const FemaleOnlyModal: React.FC<FemaleOnlyModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="female-only-title"
    >
      <div className="w-full max-w-md bg-white border-4 border-[#1a1a1a] rounded-3xl shadow-[8px_8px_0_0_#1a1a1a] p-8 text-center">
        <div className="text-5xl mb-4" aria-hidden="true">🚺</div>
        <h2 id="female-only-title" className="text-xl md:text-2xl font-black tracking-wide mb-3">
          FEMALE CATS ONLY
        </h2>
        <p className="text-sm font-bold text-[#555] mb-8">
          This feature is only available for owner who has female cats.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#F98080] hover:bg-white text-white hover:text-[#F98080] font-black py-3 border-2 border-[#1a1a1a] rounded-2xl shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[2px] transition-all text-sm tracking-wider uppercase"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default FemaleOnlyModal;
