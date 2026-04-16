import React from 'react';
import { AlertCircle, X, HelpCircle } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận', 
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  type = 'warning' 
}) {
  if (!isOpen) return null;

  const colors = {
    warning: {
      bg: 'bg-amber-50',
      icon: 'text-amber-500',
      btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
    },
    danger: {
      bg: 'bg-red-50',
      icon: 'text-red-500',
      btn: 'bg-red-500 hover:bg-red-600 shadow-red-200'
    },
    info: {
      bg: 'bg-blue-50',
      icon: 'text-blue-500',
      btn: 'bg-blue-500 hover:bg-blue-600 shadow-blue-200'
    }
  };

  const theme = colors[type] || colors.warning;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp">
        <div className={`p-6 ${theme.bg} flex flex-col items-center text-center`}>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
            {type === 'danger' ? <AlertCircle className={`w-8 h-8 ${theme.icon}`} /> : <HelpCircle className={`w-8 h-8 ${theme.icon}`} />}
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h3>
          <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="p-4 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 text-sm font-black text-white rounded-2xl shadow-lg transition-transform active:scale-95 uppercase tracking-widest ${theme.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
