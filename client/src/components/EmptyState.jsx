import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Không có dữ liệu', description = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <Icon className="w-10 h-10 text-slate-300" />
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      {description && <p className="text-xs text-slate-400 max-w-md">{description}</p>}
    </div>
  );
}
