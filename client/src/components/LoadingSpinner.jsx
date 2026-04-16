import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Đang tải dữ liệu...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-slate-500 font-medium">{text}</p>
    </div>
  );
}
