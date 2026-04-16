import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  GraduationCap, Users, TrendingUp, Clock, BookOpen, ArrowLeft,
  DollarSign, Building2, ChevronRight, ArrowRight, Layers, CheckCircle,
  BarChart3, Target, Star, Briefcase, Award, FileCheck, Hash,
  ChevronDown, MapPin, Globe, Lightbulb, Info
} from 'lucide-react';
import { majorService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { useConfig } from '../contexts/ConfigContext';

/* ──────────────── FORMAT HELPERS ──────────────── */
const fmtCurrency = (v) => {
  if (!v) return null;
  const num = Number(v);
  if (isNaN(num)) return null;
  return num.toLocaleString('vi-VN') + 'đ';
};
const fmtShortCurrency = (v) => {
  if (!v) return null;
  const num = Number(v);
  if (isNaN(num)) return null;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')} triệu/năm`;
  return num.toLocaleString('vi-VN') + 'đ/năm';
};

/* ──────────────── HERO SECTION ──────────────── */
function HeroSection({ major }) {
  return (
    <section className="relative bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-primary-light/10 rounded-full blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-14 lg:py-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-white/50 mb-8 flex-wrap">
          <Link to="/" className="hover:text-white/80 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/he-chinh-quy" className="hover:text-white/80 transition-colors">Chương trình</Link>
          <ChevronRight className="w-3 h-3" />
          {major.Faculty && (
            <>
              <Link to={`/khoa/${major.Faculty.slug || major.Faculty.id}`} className="hover:text-white/80 transition-colors">
                {major.Faculty.name}
              </Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-white/80">{major.name}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            {/* Code badge */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10">
                Mã ngành: {major.code}
              </span>
              {major.Faculty && (
                <Link
                  to={`/khoa/${major.Faculty.slug || major.Faculty.id}`}
                  className="inline-flex items-center gap-1.5 bg-white/5 text-white/70 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <Building2 className="w-3 h-3" />
                  {major.Faculty.name}
                </Link>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-5">
              {major.name}
            </h1>

            {major.description && (
              <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl line-clamp-4">
                {major.description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#overview"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-7 py-3 text-sm rounded-xl hover:bg-slate-100 hover:shadow-lg transition-all"
              >
                Xem chi tiết ngành
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/lien-he"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-7 py-3 text-sm rounded-xl hover:bg-white/10 transition-colors"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </div>

          {/* Quick info card */}
          <div className="bg-white/[0.07] backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-light" />
              Thông tin nhanh
            </h3>
            <div className="space-y-4">
              <QuickInfoItem icon={Clock} label="Thời gian đào tạo" value="4 năm (8 học kỳ)" />
              <QuickInfoItem icon={GraduationCap} label="Bằng cấp" value="Cử nhân" />
              {major.quota && major.quota > 0 && (
                <QuickInfoItem icon={Users} label="Chỉ tiêu tuyển sinh" value={`${major.quota} sinh viên`} />
              )}
              {major.tuition && Number(major.tuition) > 0 && (
                <QuickInfoItem icon={DollarSign} label="Học phí" value={fmtShortCurrency(major.tuition)} />
              )}
              {major.Faculty && (
                <QuickInfoItem icon={Building2} label="Khoa" value={major.Faculty.name} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickInfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary-light" />
      </div>
      <div>
        <p className="text-[11px] text-white/40 leading-tight">{label}</p>
        <p className="text-sm font-semibold text-white/90">{value}</p>
      </div>
    </div>
  );
}

/* ──────────────── STICKY NAV ──────────────── */
function StickyNav({ sections }) {
  const [active, setActive] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px' }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const available = sections.filter((s) => s.show);
  if (available.length <= 1) return null;

  return (
    <div className="sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-0 scrollbar-hide">
          {available.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                active === s.id
                  ? 'text-primary border-primary'
                  : 'text-slate-500 border-transparent hover:text-primary hover:border-primary/30'
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}



/* ──────────────── DESCRIPTION SECTION ──────────────── */
function DescriptionSection({ major }) {
  if (!major.description) return null;

  return (
    <section id="description" className="max-w-7xl mx-auto px-4 py-14">
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            
            <div>
              <h2 className="text-xl font-black text-slate-900">Giới thiệu ngành</h2>
              <p className="text-xs text-slate-400">Tổng quan về chương trình đào tạo</p>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{major.description}</p>
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="space-y-4">
          <div className="bg-indigo-50/50 border border-indigo-100/50 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Điểm nổi bật</h3>
            </div>
            <ul className="space-y-2.5">
              <HighlightItem text="Chương trình cập nhật theo chuẩn quốc tế" />
              <HighlightItem text="Giảng viên có trình độ Tiến sĩ trở lên" />
              <HighlightItem text="Thực tập tại doanh nghiệp từ năm 3" />
              <HighlightItem text="Cơ hội trao đổi sinh viên quốc tế" />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function HighlightItem({ text }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
      <span className="text-xs text-slate-600 leading-relaxed">{text}</span>
    </li>
  );
}

/* ──────────────── SUBJECT GROUPS (ADMISSION BLOCKS) ──────────────── */
function SubjectGroupsSection({ groups }) {
  if (!groups || groups.length === 0) return null;

  return (
    <section id="admission" className="bg-background-light border-y border-slate-100 py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Tổ hợp xét tuyển</h2>
            <p className="text-xs text-slate-400">{groups.length} tổ hợp môn được chấp nhận</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g, i) => (
            <div
              key={g.id}
              className="bg-white border border-slate-100 p-5 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 bg-slate-800 text-white text-sm font-black px-3 py-1.5 rounded-lg">
                  {g.code}
                </span>
                <span className="text-[10px] text-slate-300 font-mono">#{String(i + 1).padStart(2, '0')}</span>
              </div>
              {g.name && (
                <p className="text-xs text-slate-600 leading-relaxed">{g.name}</p>
              )}
              {!g.name && g.code && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {g.code.split('').map((char, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-500 text-[11px] font-medium px-2 py-0.5 rounded-md">
                      {char === 'A' ? 'Toán' : char === 'B' ? 'Lý/Hóa/Sinh' : char === 'C' ? 'Văn' : char === 'D' ? 'Tiếng Anh' : char}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecializationsSection({ specs, major }) {
  if (!specs || specs.length === 0) return null;

  const parseAdmissionCodes = (str) => {
    try {
      if (!str) return {};
      const parsed = JSON.parse(str);
      return typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      if (str && str.trim()) return { "original": str };
      return {};
    }
  };

  return (
    <section id="specializations" className="max-w-7xl mx-auto px-4 py-16 bg-white">
      <div className="flex items-center gap-3 mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Hướng chuyên sâu</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{specs.length} chuyên ngành đào tạo trong chương trình</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {specs.map((s) => {
          const codes = parseAdmissionCodes(s.admission_code);
          const entries = Object.entries(codes);
          
          return (
            <div
              key={s.id}
              className="group relative bg-slate-50/50 border border-slate-100 p-8 rounded-[2rem] hover:bg-white hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <span className="inline-block bg-indigo-100 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-lg mb-3 uppercase tracking-widest">
                      {s.code}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {s.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                     <Award className="w-5 h-5 text-indigo-500 group-hover:text-white" />
                  </div>
                </div>

                {/* Admission Info */}
                {entries.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {entries.map(([tid, code]) => {
                      if (tid === 'original') return (
                        <span key="orig" className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                          Mã XT: {code}
                        </span>
                      );
                      const type = major.TrainingTypes?.find(t => t.id.toString() === tid);
                      return (
                        <div key={tid} className="flex items-center bg-primary/5 border border-primary/10 rounded-lg overflow-hidden group/mxt hover:border-primary/30 transition-colors">
                          <span className="bg-primary text-white text-[9px] font-black px-2 py-1.5 uppercase tracking-wider">{type?.name || tid}</span>
                          <span className="text-primary text-[10px] font-bold px-3 py-1 bg-white/50 group-hover/mxt:bg-white transition-colors">
                            Mã xét tuyển: {code}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">
                     <Info className="w-3 h-3" /> Chi tiết hướng chuyên sâu
                  </div>
                  {s.description ? (
                    <p className="text-sm text-slate-600 leading-[1.7] font-medium text-justify whitespace-pre-line">
                      {s.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Mô tả về hướng chuyên sâu này đang được cập nhật bởi ban đào tạo.</p>
                  )}
                </div>
                
                <div className="mt-8 flex items-center gap-2">
                   {[1,2,3].map(dot => (
                     <div key={dot} className="w-1 h-1 bg-indigo-200 rounded-full group-hover:bg-indigo-400 transition-colors" />
                   ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ──────────────── HISTORICAL SCORES ──────────────── */
function HistoricalScoresSection({ scores }) {
  if (!scores || scores.length === 0) return null;

  const sorted = [...scores].sort((a, b) => b.year - a.year);
  const maxScore = Math.max(...sorted.map((s) => s.score));
  const minScore = Math.min(...sorted.map((s) => s.score));

  // Group by year for multi-method display
  const byYear = {};
  sorted.forEach((s) => {
    if (!byYear[s.year]) byYear[s.year] = [];
    byYear[s.year].push(s);
  });
  const years = Object.keys(byYear).sort((a, b) => b - a);

  return (
    <section id="scores" className="bg-background-light border-y border-slate-100 py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          
          <div>
            <h2 className="text-xl font-black text-slate-900">Điểm chuẩn các năm</h2>
            <p className="text-xs text-slate-400">
              Biên độ: {minScore} — {maxScore} điểm
              {years.length > 0 && ` • ${years[years.length - 1]} — ${years[0]}`}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Visual bar chart */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Biểu đồ điểm chuẩn</h3>
            <div className="space-y-3">
              {sorted.map((s, i) => {
                const pct = maxScore > 0 ? (s.score / 30) * 100 : 50;
                return (
                  <div key={`${s.year}-${i}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">
                        {s.year}
                        {s.AdmissionMethod?.name && (
                          <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                            ({s.AdmissionMethod.name})
                          </span>
                        )}
                      </span>
                      <span className="text-xs font-black text-primary">{s.score}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.max(pct, 5)}%`,
                          background: `linear-gradient(to right, ${pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#10b981'}, ${pct > 80 ? '#dc2626' : pct > 60 ? '#d97706' : '#059669'})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-300">
              <span>0</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
            </div>
          </div>

          {/* Data table */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Bảng dữ liệu chi tiết</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 rounded-xl">
                    <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px] first:rounded-l-xl last:rounded-r-xl">Năm</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Phương thức</th>
                    <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Điểm chuẩn</th>
                    <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px] first:rounded-l-xl last:rounded-r-xl">Biến động</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s, i) => {
                    const prev = sorted[i + 1];
                    const diff = prev ? (s.score - prev.score).toFixed(2) : null;
                    return (
                      <tr key={`${s.year}-${i}`} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-800">{s.year}</td>
                        <td className="px-4 py-3 text-slate-600">{s.AdmissionMethod?.name || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-block bg-primary/10 text-primary font-black px-2 py-0.5 text-xs rounded-md">
                            {s.score}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {diff !== null ? (
                            <span className={`text-xs font-semibold ${Number(diff) > 0 ? 'text-rose-500' : Number(diff) < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                              {Number(diff) > 0 ? `+${diff}` : diff}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── CAREER PROSPECTS ──────────────── */
function CareerProspectsSection({ major }) {
  const careers = [
    `Chuyên viên phân tích trong lĩnh vực ${major.name}`,
    'Quản lý dự án tại các doanh nghiệp trong và ngoài nước',
    'Chuyên gia tư vấn cho các tổ chức, đơn vị hành chính sự nghiệp',
    'Giảng viên, nghiên cứu viên tại các trường đại học, viện nghiên cứu',
    'Tự khởi nghiệp hoặc điều hành doanh nghiệp riêng',
    'Tiếp tục học lên bậc Thạc sĩ, Tiến sĩ trong và ngoài nước',
  ];

  return (
    <section id="career" className="max-w-7xl mx-auto px-4 py-14">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <div className="flex items-center gap-3 mb-6">
            
            <div>
              <h2 className="text-xl font-black text-slate-900">Cơ hội việc làm</h2>
              <p className="text-xs text-slate-400">Triển vọng nghề nghiệp sau tốt nghiệp</p>
            </div>
          </div>

          <div className="space-y-3">
            {careers.map((c, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500 transition-colors">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{c}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-8 text-white rounded-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <Star className="w-10 h-10 mb-4 opacity-60" />
          <h3 className="text-lg font-bold mb-3">Vì sao chọn ngành {major.name}?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
              <CheckCircle className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
              <span>Nhu cầu tuyển dụng cao và ổn định trên thị trường lao động</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
              <CheckCircle className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
              <span>Mức lương cạnh tranh ngay sau khi tốt nghiệp</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
              <CheckCircle className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
              <span>Cơ hội thăng tiến và phát triển sự nghiệp đa dạng</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
              <CheckCircle className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
              <span>Có thể làm việc tại nhiều ngành, lĩnh vực khác nhau</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── CTA SECTION ──────────────── */
function CTASection({ major }) {
  return (
    <section className="bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-14 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sẵn sàng theo học {major.name}?
          </h2>
          <p className="mt-2 text-white/70 max-w-lg text-sm">
            Tìm hiểu thông tin tuyển sinh chi tiết hoặc liên hệ phòng tuyển sinh để được tư vấn
            về ngành học và cơ hội nghề nghiệp.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/nganh-dao-tao"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 text-sm rounded-xl hover:bg-slate-100 hover:shadow-lg transition-all"
          >
            Xem các ngành khác
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/lien-he"
            className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3.5 text-sm rounded-xl hover:bg-white/10 transition-colors"
          >
            Liên hệ tư vấn
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── RELATED ACTIONS ──────────────── */
function RelatedActions({ major }) {
  const actions = [
    { icon: FileCheck, label: 'Phương thức xét tuyển', to: '/phuong-thuc-xet-tuyen', desc: 'Xem các phương thức xét tuyển áp dụng' },
    { icon: BarChart3, label: 'Tra cứu điểm chuẩn', to: '/tra-cuu-diem-chuan', desc: 'Tra cứu điểm chuẩn tất cả các ngành' },
    { icon: Award, label: 'Chương trình đào tạo', to: '/he-chinh-quy', desc: 'Xem chi tiết chương trình đào tạo' },
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-100 py-14">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-lg font-black text-slate-900 mb-6 text-center">Hành động tiếp theo</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-4 bg-white border border-slate-100 p-5 rounded-2xl hover:border-primary hover:shadow-lg transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                  <Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{a.label}</h3>
                  <p className="text-[11px] text-slate-400">{a.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────── IMAGES GALLERY ──────────────── */
function MajorGallerySection({ images }) {
  if (!images || images.length === 0) return null;

  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Hình ảnh hoạt động</h2>
            <p className="text-xs text-slate-400">Hình ảnh về môi trường học tập và hoạt động của ngành</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div key={img.id} className="aspect-video overflow-hidden rounded-2xl border border-slate-100 group cursor-zoom-in">
              <img 
                src={img.image_url} 
                alt={`Hoạt động ${i+1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────── MAIN PAGE ──────────────── */
export default function MajorDetail() {
  const { id } = useParams();
  const { config } = useConfig();
  const admissionYear = config.current_year || '2024';
  const [major, setMajor] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMajor = async () => {
    try {
      setLoading(true);
      setError(null);
      const [majorData, imageData] = await Promise.all([
        majorService.getMajorById(id),
        majorService.getMajorImages(id)
      ]);
      setMajor(majorData);
      setImages(imageData || []);
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin ngành');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMajor(); }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={fetchMajor} />;
  if (!major) return null;

  const scores = (major.HistoricalScores || []).sort((a, b) => b.year - a.year);
  const specs = major.Specializations || [];
  const groups = major.SubjectGroups || [];
  const latestScore = scores[0] || null;

  const navSections = [
    { id: 'overview', label: 'Tổng quan', show: true },
    { id: 'description', label: 'Giới thiệu', show: !!major.description },

    { id: 'admission', label: 'Tổ hợp xét tuyển', show: groups.length > 0 },
    { id: 'specializations', label: 'Chuyên ngành', show: specs.length > 0 },
    { id: 'scores', label: 'Điểm chuẩn', show: scores.length > 0 },
    { id: 'career', label: 'Việc làm', show: true },
  ];

  return (
    <div>
      <HeroSection major={major} />
      <StickyNav sections={navSections} />
      <MajorGallerySection images={images} />

      <DescriptionSection major={major} />
      <SubjectGroupsSection groups={groups} />
      <SpecializationsSection specs={specs} major={major} />
      <HistoricalScoresSection scores={scores} />
      <CareerProspectsSection major={major} />
      <RelatedActions major={major} />
      <CTASection major={major} />
    </div>
  );
}
