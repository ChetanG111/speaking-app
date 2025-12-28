
import React from 'react';

interface ErrorDialogProps {
  onClose: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-elevated rounded-[32px] p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 mx-auto">
          <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-primary text-center mb-3">Out of Credits</h2>
        <p className="text-secondary text-center text-sm leading-relaxed mb-8">
          Your Gemini API quota has been exhausted. To continue transcribing your voice notes, please check your billing status or usage limits.
        </p>

        <div className="flex flex-col gap-3">
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-3 px-6 bg-accent text-background rounded-full text-center font-bold text-sm hover:brightness-90 transition-all active:scale-[0.98]"
          >
            Manage Billing
          </a>
          <button 
            onClick={onClose}
            className="w-full py-3 px-6 text-secondary hover:text-primary rounded-full text-center font-bold text-sm transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
