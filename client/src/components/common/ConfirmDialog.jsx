import { X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          
            <div 
                className="absolute inset-0 bg-black/50" 
                onClick={onClose}
            />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {title}
                </h3>

                <p className="text-gray-600 mb-6 whitespace-pre-line">
                    {message}
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700 transition"
                    >
                        Xác nhận xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
