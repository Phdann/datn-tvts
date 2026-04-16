import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, ArrowRight, GraduationCap, DollarSign } from 'lucide-react';

export default function MajorCard({ major }) {
  const latestScore = major.HistoricalScores?.sort((a, b) => b.year - a.year)?.[0];
  const fmtCurrency = (v) => {
    if (!v) return null;
    const num = Number(v);
    if (isNaN(num)) return null;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')} triệu`;
    return num.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <Link
      to={`/nganh-dao-tao/${major.id}`}
      className="group block bg-white border border-slate-100 rounded-2xl hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
    >

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg">
            {major.code}
          </span>
          {major.Faculty && (
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
              {major.Faculty.name}
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {major.name}
        </h3>

        {major.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
            {major.description}
          </p>
        )}

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {major.quota > 0 && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-1 rounded-lg">
              <Users className="w-3 h-3" /> {major.quota} chỉ tiêu
            </span>
          )}
          {latestScore && (
            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[10px] font-semibold px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3" /> {latestScore.score} điểm ({latestScore.year})
            </span>
          )}
          {fmtCurrency(major.tuition) && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-1 rounded-lg">
              <DollarSign className="w-3 h-3" /> {fmtCurrency(major.tuition)}/năm
            </span>
          )}
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-1 rounded-lg">
            <GraduationCap className="w-3 h-3" /> 4 năm
          </span>
        </div>

        {/* Subject groups */}
        {major.SubjectGroups?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {major.SubjectGroups.slice(0, 4).map((sg) => (
              <span key={sg.id} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                {sg.code}
              </span>
            ))}
            {major.SubjectGroups.length > 4 && (
              <span className="text-[10px] text-slate-400">+{major.SubjectGroups.length - 4}</span>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium">Xem chương trình đào tạo</span>
          <span className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0">
            Chi tiết <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
