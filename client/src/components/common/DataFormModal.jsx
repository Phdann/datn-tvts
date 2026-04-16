import { X } from 'lucide-react';
import { useEffect } from 'react';

const DataFormModal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    onSubmit,
    submitLabel = 'Lưu',
    cancelLabel = 'Hủy',
    size = 'md' // sm, md, lg, xl
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`relative w-full ${sizeClasses[size]} bg-white shadow-2xl transform transition-all`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={onSubmit}>
                        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {children}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-primary text-white font-bold hover:bg-primary-dark transition"
                            >
                                {submitLabel}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DataFormModal;
