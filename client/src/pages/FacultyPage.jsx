import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2, BookOpen, ArrowRight, Users, GraduationCap,
  DollarSign, ChevronRight, ArrowLeft, Layers, BarChart3,
  CheckCircle, Globe, TrendingUp, Briefcase, Star, Target, Info
} from 'lucide-react';
import { facultyService } from '../services';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

/* ──────────────── FORMAT HELPERS ──────────────── */
const fmtCurrency = (v) => {
  if (!v) return null;
  const num = Number(v);
  if (isNaN(num)) return null;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')} triệu`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toLocaleString('vi-VN');
};

/* ──────────────── MEDIA HELPERS ──────────────── */
const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const root = baseUrl.replace('/api', '');
  return `${root}/${url.startsWith('/') ? url.slice(1) : url}`;
};

/* ──────────────── HERO SECTION ──────────────── */
function HeroSection({ faculty, majorCount, banners }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners?.length > 1) {
      const interval = setInterval(() => {
        setIndex(i => (i + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const activeBanner = banners && banners.length > 0 ? banners[index] : null;
  const rawBg = activeBanner?.image_url || faculty.banner_image_url;
  const bgImage = getMediaUrl(rawBg);

  return (
    <section className="relative bg-slate-900 overflow-hidden">
      {/* Banner Image Background */}
      {bgImage && (
        <img
          src={bgImage}
          alt={activeBanner?.title || faculty.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          key={bgImage}
        />
      )}

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

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/50" />

      <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="flex items-center gap-2 text-xs text-white/50 mb-8">
          <Link to="/" className="hover:text-white/80 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/he-chinh-quy" className="hover:text-white/80 transition-colors">Chương trình đào tạo</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/80">{faculty.name}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              {faculty.logo_url ? (
                <div className="w-16 h-16 bg-white border-2 border-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl backdrop-blur-md overflow-hidden">
                  <img src={getMediaUrl(faculty.logo_url)} alt={faculty.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Building2 className="w-8 h-8 text-white/70" />
                </div>
              )}
              <div>
                {faculty.code && (
                  <span className="inline-block bg-primary/20 text-primary-light text-[10px] font-bold px-2.5 py-0.5 rounded-lg mb-1 uppercase tracking-wider">
                    Mã khoa: {faculty.code}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                  {faculty.name}
                </h1>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#majors"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 text-sm rounded-xl hover:bg-slate-100 hover:shadow-xl hover:shadow-white/10 transition-all"
              >
                Khám phá ngành đào tạo
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/lien-he"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 text-sm rounded-xl hover:bg-white/10 transition-colors"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </div>

          <div className="bg-white/[0.07] backdrop-blur-md border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />

            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="w-1 h-5 bg-primary-light rounded-full" />
              Thông tin chung
            </h3>
            <div className="space-y-5">
              <StatItem icon={BookOpen} label="Ngành đào tạo" value={`${majorCount} ngành`} />
              <StatItem icon={GraduationCap} label="Bậc đào tạo" value="Cử nhân / Thạc sĩ" />
              <StatItem icon={Users} label="Hình thức" value="Đào tạo chính quy" />
              <StatItem icon={Globe} label="Trực thuộc" value="Đại học Đà Nẵng" />
            </div>
          </div>
        </div>

        {/* Banner Dots */}
        {banners?.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`transition-all duration-300 ${i === index ? 'w-8 h-2 bg-white rounded-full' : 'w-2 h-2 bg-white/40 rounded-full hover:bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatItem({ icon: Icon, label, value }) {
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


/* ──────────────── MAJOR CARD (PREMIUM) ──────────────── */
function PremiumMajorCard({ major, index }) {
  const tuitionStr = fmtCurrency(major.tuition);

  return (
    <Link
      to={`/nganh-dao-tao/${major.id}`}
      className="group relative bg-white border border-slate-100 rounded-2xl hover:border-primary transition-all hover:shadow-xl hover:shadow-primary/5 overflow-hidden h-full flex flex-col"
    >

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg mb-2.5 tracking-wide">
              {major.code}
            </span>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug">
              {major.name}
            </h3>
          </div>
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 text-slate-300 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="text-xs font-black">{String(index + 1).padStart(2, '0')}</span>
          </div>
        </div>

        {major.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
            {major.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {major.quota > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
              <CheckCircle className="w-3 h-3" />
              {major.quota} chỉ tiêu
            </div>
          )}
          {tuitionStr && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
              <DollarSign className="w-3 h-3" />
              {tuitionStr} / năm
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
            <GraduationCap className="w-3 h-3" />
            4 năm
          </div>
        </div>

        {major.Specializations?.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Chuyên ngành</p>
            <div className="flex flex-wrap gap-1.5">
              {major.Specializations.slice(0, 3).map((s) => (
                <span key={s.id} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
                  {s.name}
                </span>
              ))}
              {major.Specializations.length > 3 && (
                <span className="text-[10px] text-primary font-semibold">
                  +{major.Specializations.length - 3} khác
                </span>
              )}
            </div>
          </div>
        )}

        {major.SubjectGroups?.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Tổ hợp xét tuyển</p>
            <div className="flex flex-wrap gap-1.5">
              {major.SubjectGroups.slice(0, 5).map((sg) => (
                <span key={sg.id} className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md border border-primary/10">
                  {sg.code}
                </span>
              ))}
              {major.SubjectGroups.length > 5 && (
                <span className="text-[10px] text-slate-400">+{major.SubjectGroups.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {/* Footer sticks to bottom */}
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Layers className="w-3 h-3" />
            <span>Xem chương trình đào tạo</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0">
            Chi tiết <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ──────────────── WHY THIS FACULTY SECTION ──────────────── */
function WhySection({ faculty }) {
  const reasons = [
    {
      icon: Star,
      title: 'Chất lượng đào tạo hàng đầu',
      desc: 'Chương trình được kiểm định, cập nhật theo chuẩn quốc tế và nhu cầu thực tiễn.',
    },
    {
      icon: Briefcase,
      title: 'Cơ hội việc làm rộng mở',
      desc: 'Hợp tác với nhiều doanh nghiệp, sinh viên có cơ hội thực tập và việc làm ngay khi còn đi học.',
    },
    {
      icon: TrendingUp,
      title: 'Giảng viên giàu kinh nghiệm',
      desc: 'Đội ngũ giảng viên có trình độ cao, nhiều kinh nghiệm nghiên cứu và giảng dạy.',
    },
    {
      icon: Globe,
      title: 'Hội nhập quốc tế',
      desc: 'Sinh viên được tiếp cận chương trình trao đổi, hội thảo và dự án hợp tác quốc tế.',
    },
  ];

  return (
    <section className="bg-background-light border-y border-slate-100 py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Thế mạnh</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tại sao chọn {faculty.name}?
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="bg-white border border-slate-100 p-6 rounded-2xl hover:border-primary hover:shadow-lg transition-all group text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors">
                  <Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">{r.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────── CTA SECTION ──────────────── */
function CTASection({ faculty }) {
  return (
    <section className="bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-14 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bắt đầu hành trình tại {faculty.name}
          </h2>
          <p className="mt-2 text-white/70 max-w-lg text-sm">
            Tìm hiểu thông tin tuyển sinh chi tiết hoặc liên hệ phòng tuyển sinh để được tư vấn chi tiết
            về các ngành đào tạo và cơ hội nghề nghiệp.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/nganh-dao-tao"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 text-sm rounded-xl hover:bg-slate-100 hover:shadow-lg transition-all"
          >
            Xem ngành đào tạo
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

/* ──────────────── TUITION TABLE ──────────────── */
function TuitionOverview({ majors }) {
  const withTuition = majors.filter(m => m.tuition && Number(m.tuition) > 0);
  if (withTuition.length === 0) return null;

  const sorted = [...withTuition].sort((a, b) => Number(a.tuition) - Number(b.tuition));
  const min = Number(sorted[0].tuition);
  const max = Number(sorted[sorted.length - 1].tuition);

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Học phí tham khảo</h2>
          <p className="text-xs text-slate-400">Mức học phí dự kiến theo từng ngành (VNĐ/năm)</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((m) => {
          const tuition = Number(m.tuition);
          const pct = max > min ? ((tuition - min) / (max - min)) * 100 : 50;
          return (
            <div key={m.id} className="bg-white border border-slate-100 px-5 py-4 rounded-2xl hover:border-amber-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 truncate flex-1 mr-2">{m.name}</span>
                <span className="text-xs font-black text-amber-600 shrink-0">{fmtCurrency(tuition)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(pct, 10)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ──────────────── QUOTA TABLE ──────────────── */
function QuotaOverview({ majors }) {
  const withQuota = majors.filter(m => m.quota && m.quota > 0);
  if (withQuota.length === 0) return null;

  const totalQuota = withQuota.reduce((s, m) => s + m.quota, 0);
  const sorted = [...withQuota].sort((a, b) => b.quota - a.quota);
  const maxQuota = sorted[0].quota;

  return (
    <section className="bg-slate-50 border-y border-slate-100 py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Chỉ tiêu tuyển sinh</h2>
            <p className="text-xs text-slate-400">Tổng chỉ tiêu: <strong className="text-emerald-600">{totalQuota}</strong> sinh viên</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {sorted.map((m) => {
            const pct = (m.quota / maxQuota) * 100;
            return (
              <div key={m.id} className="bg-white border border-slate-100 px-5 py-3 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">{m.name}</span>
                    <span className="text-xs font-black text-emerald-600 ml-2 shrink-0">{m.quota}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────── OVERVIEW SECTION ──────────────── */
function OverviewSection({ faculty }) {
  if (!faculty.introduction) return null;
  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8 justify-center">

            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Giới thiệu về Khoa</h2>
          </div>

          <div className="bg-slate-50/50 border border-slate-100 p-8 sm:p-12 rounded-[2.5rem] relative group">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors" />

            <p className="text-slate-600 leading-[1.8] text-base sm:text-lg font-medium whitespace-pre-line relative z-10 text-justify">
              {faculty.introduction}
            </p>

            <div className="mt-10 flex items-center gap-4 pt-8 border-t border-slate-200/60 relative z-10">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gia nhập cộng đồng sinh viên ngay hôm nay</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── MAIN PAGE ──────────────── */
export default function FacultyPage() {
  const { slug } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await facultyService.getFacultyBySlug(slug);
      setFaculty(data);

      // Fetch faculty-specific banners
      if (data?.id) {
        api.get('/banners', { params: { faculty_id: data.id, position: 'faculty_top', is_active: true } })
          .then(res => setBanners(Array.isArray(res.data) ? res.data : []))
          .catch(() => setBanners([]));
      }
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin khoa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaculty(); }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={fetchFaculty} />;
  if (!faculty) return null;

  const majors = faculty.Majors || [];

  return (
    <div className="bg-white">
      <HeroSection faculty={faculty} majorCount={majors.length} banners={banners} />

      <OverviewSection faculty={faculty} />

      <section id="majors" className="max-w-7xl mx-auto px-4 py-20 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Đào tạo chuyên sâu</p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Các ngành đào tạo
            </h2>
            <p className="mt-3 text-base text-slate-500 max-w-xl">
              {majors.length > 0
                ? `Hiện có ${majors.length} chương trình đào tạo chính quy chất lượng cao.`
                : 'Chưa có ngành đào tạo nào được cập nhật.'}
            </p>
          </div>
          <Link
            to="/he-chinh-quy"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Tất cả chương trình
          </Link>
        </div>

        {majors.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] py-20 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Chưa có ngành đào tạo nào</p>
            <p className="text-xs text-slate-400 mt-2">Dữ liệu đang được đội ngũ quản trị cập nhật</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {majors.map((m, i) => (
              <PremiumMajorCard key={m.id} major={m} index={i} />
            ))}
          </div>
        )}
      </section>

      <QuotaOverview majors={majors} />
      <TuitionOverview majors={majors} />
      <WhySection faculty={faculty} />
      <CTASection faculty={faculty} />
    </div>
  );
}
