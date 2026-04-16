import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Đã xảy ra lỗi khi tải dữ liệu.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <AlertTriangle className="w-10 h-10 text-red-500" />
      <p className="text-sm text-slate-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 hover:bg-primary-light transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </button>
      )}
    </div>
  );
}
