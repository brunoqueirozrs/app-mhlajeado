import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm ">
      <div 
        className="card-modern border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden "
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{title}</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 card-modern border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 border border-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
