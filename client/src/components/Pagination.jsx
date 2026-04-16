import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const btn = 'w-9 h-9 flex items-center justify-center text-sm font-medium transition-colors';

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${btn} ${page <= 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-primary hover:text-white'}`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={`${btn} text-slate-600 hover:bg-primary hover:text-white`}>1</button>
          {start > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${btn} ${p === page ? 'bg-primary text-white' : 'text-slate-600 hover:bg-primary hover:text-white'}`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <button onClick={() => onPageChange(totalPages)} className={`${btn} text-slate-600 hover:bg-primary hover:text-white`}>{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${btn} ${page >= totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-primary hover:text-white'}`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
