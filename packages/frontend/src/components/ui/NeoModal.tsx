import type { ReactNode } from "react";

interface NeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function NeoModal({ isOpen, onClose, title, children, size = "md" }: NeoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={`
          relative w-full ${sizeMap[size]}
          bg-white border-3 border-black rounded-2xl
          shadow-[6px_6px_0_0_rgba(0,0,0)]
          animate-[slide-up-fade-in_0.3s_ease-out]
          max-h-[85vh] flex flex-col
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
            <h2 className="font-paytone text-xl">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-black
                         hover:bg-skred hover:text-white transition-colors font-bold text-lg"
            >
              ×
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
