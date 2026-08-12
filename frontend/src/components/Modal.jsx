import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, size = 'md', subtitle }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  const modalMarkup = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Semi-transparent blurred backdrop covering the whole viewport screen */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />
      {/* Centered Modal Dialog Card */}
      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl border border-[#dde5ec] w-full max-h-[90vh] overflow-hidden
          animate-scale-in z-10 flex flex-col my-auto text-[#1c2b33]
          ${sizes[size] || sizes.md}
        `}
      >
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#dde5ec] bg-[#f1f5f8]">
          <div>
            <h2 className="text-lg font-heading font-black text-[#1c2b33] tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 font-semibold mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-[#0064e0] hover:bg-[#e7f0fa] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#dde5ec]"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
};

export default Modal;
