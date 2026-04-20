import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, GraduationCap, BookOpen, FileCheck, Users, Award,
  BarChart3, ChevronRight, Search, Calculator, MapPin, Phone,
  Mail, Clock, Star, TrendingUp, Newspaper, CalendarDays,
  Building2, CheckCircle, ChevronLeft
} from 'lucide-react';
import { getFaculties } from '../services/facultyService';
import { postService, bannerService } from '../services';
import api from '../services/api';
import { useConfig } from '../contexts/ConfigContext';

/* ──────────────── HERO ──────────────── */
function HeroSection({ banners }) {
  const [index, setIndex] = useState(0);
  const { config } = useConfig();
  const admissionYear = config.current_year || '2026';

  useEffect(() => {
    if (banners?.length > 1) {
      const timer = setInterval(() => {
        setIndex((i) => (i + 1) % banners.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  const activeBanner = banners && banners.length > 0 ? banners[index] : null;

  return (
    <section className="relative bg-blue-950 overflow-hidden min-h-[600px] flex items-center">
      {/* Background Image / Slider */}
      <div className="absolute inset-0 z-0">
        {activeBanner ? (
          <div className="absolute inset-0 transition-opacity duration-1000">
            <img 
              src={activeBanner.image_url.startsWith('http') ? activeBanner.image_url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${activeBanner.image_url}`} 
              alt={activeBanner.title || 'DUE Banner'} 
              className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"
            />
          </div>
        ) : (
          /* Geometric decorations for fallback */
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/30 rotate-45" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-light/15 -translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-white/5 rotate-12 -translate-x-1/2 -translate-y-1/2" />
          </div>
        )}
        <div 
          className="absolute inset-0 opacity-[0.03] z-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/80 to-transparent z-20" />
      </div>

      <div className="relative z-30 max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div></div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              {activeBanner?.title || (
                <>
                  Khởi đầu
                  <br />
                  tương lai của bạn
                  <br />
                  <span className="text-primary-light">tại DUE</span>
                </>
              )}
            </h1>

            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-lg font-medium">
              Trường Đại học Kinh tế — Đại học Đà Nẵng. Hơn 55 năm đào tạo nguồn
              nhân lực chất lượng cao trong lĩnh vực Kinh tế, Quản trị và Công nghệ.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/nganh-dao-tao"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold px-8 py-4 text-sm hover:shadow-xl hover:shadow-primary/20 transition-all rounded-xl"
              >
                Khám phá ngay
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/nganh-dao-tao"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/20 text-white font-bold px-8 py-4 text-sm hover:bg-white/10 transition-colors rounded-xl"
              >
                Xem ngành đào tạo
              </Link>
            </div>

            {/* Slider Dots */}
            {banners?.length > 1 && (
              <div className="mt-12 flex items-center gap-3">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
                      i === index ? 'w-8 bg-primary-light' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right — Info card */}
          <div className="hidden lg:block animate-in fade-in slide-in-from-right duration-700">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
              
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary-light rounded-full" />
                Thông tin tuyển sinh {admissionYear}
              </h3>
              
              <div className="space-y-3">
                {[
                  { label: 'Phương thức xét tuyển', to: '/phuong-thuc-xet-tuyen', icon: FileCheck },
                  { label: `Chỉ tiêu tuyển sinh ${admissionYear}`, to: '/chi-tieu-tuyen-sinh', icon: BarChart3 },
                  { label: 'Tra cứu điểm chuẩn các năm', to: '/tra-cuu-diem-chuan', icon: Search },
                  { label: 'Học bổng tuyển sinh', to: '/hoc-bong-chinh-sach', icon: Award },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center justify-between gap-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-5 py-4 text-sm text-white/90 transition-all group/item rounded-xl"
                    >
                      <span className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors">
                          <Icon className="w-4 h-4 text-white/40 group-hover/item:text-primary-light" />
                        </div>
                        <span className="font-semibold">{item.label}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover/item:text-white group-hover/item:translate-x-1 transition-all" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                <span>Cập nhật mới nhất: 16/03/2026</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                  Hệ thống sẵn sàng
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── QUICK TOOLS ──────────────── */
function QuickToolsSection() {
  const tools = [
    {
      icon: Search,
      title: 'Tra cứu điểm chuẩn',
      desc: 'Tra cứu điểm chuẩn các ngành qua các năm để định hướng lựa chọn phù hợp.',
      to: '/tra-cuu-diem-chuan',
      color: 'bg-secondary',
    },
    {
      icon: Award,
      title: 'Học bổng tuyển sinh',
      desc: 'Thông tin về các chương trình học bổng và chính sách hỗ trợ tài chính cho tân sinh viên.',
      to: '/hoc-bong-chinh-sach',
      color: 'bg-accent',
    },
    {
      icon: GraduationCap,
      title: 'Tư vấn tuyển sinh AI',
      desc: 'Chatbot AI hỗ trợ giải đáp mọi thắc mắc về tuyển sinh 24/7 ngay trên trang web.',
      to: '#',
      color: 'bg-primary',
      isChat: true,
    },
  ];

  return (
    <section className="bg-white border-b border-slate-100 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
            Tiện ích nổi bật
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Công cụ hỗ trợ thí sinh
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            Nền tảng tích hợp công nghệ giúp thí sinh tra cứu thông tin tuyển sinh dễ dàng.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {tools.map((f) => {
            const Icon = f.icon;
            const Wrapper = f.isChat ? 'div' : Link;
            const wrapperProps = f.isChat ? { 
              onClick: () => window.dispatchEvent(new CustomEvent('open-chat'))
            } : { to: f.to };
            return (
              <Wrapper
                key={f.title}
                {...wrapperProps}
                className="group relative bg-white border border-slate-100 p-8 rounded-xl hover:border-primary transition-all cursor-pointer w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm flex flex-col items-center text-center shadow-sm hover:shadow-md"
              >
                <div className={`w-14 h-14 ${f.color} flex items-center justify-center mb-6 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-primary/10`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">{f.desc}</p>
                <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  {f.isChat ? 'Mở chat AI' : 'Tìm hiểu thêm'}
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────── FACULTIES SECTION ──────────────── */
function FacultiesSection() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFaculties()
      .then((data) => setFaculties(Array.isArray(data) ? data : data?.data || []))
      .catch(() => setFaculties([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (faculties.length === 0) return null;

  return (
    <section className="bg-background-light py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
              Đào tạo
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Các Khoa đào tạo
            </h2>
            <p className="mt-2 text-slate-500 max-w-lg">
              Trường Đại học Kinh tế — Đại học Đà Nẵng có nhiều khoa đào tạo đa ngành, đáp ứng nhu cầu nguồn nhân lực chất lượng cao.
            </p>
          </div>
          <Link
            to="/nganh-dao-tao"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline shrink-0"
          >
            Xem tất cả ngành <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculties.map((fac) => {
            const majorCount = fac.Majors?.length || 0;
            return (
              <Link
                key={fac.id}
                to={`/khoa/${fac.slug || fac.id}`}
                className="group bg-white border border-slate-100 p-6 rounded-xl hover:border-primary transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden border border-slate-100 shadow-sm group-hover:border-primary/50 transition-all bg-white flex items-center justify-center">
                    {fac.logo_url ? (
                      <img 
                        src={fac.logo_url.startsWith('http') ? fac.logo_url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${fac.logo_url}`} 
                        alt={fac.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center group-hover:bg-primary transition-colors">
                        <Building2 className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors mb-1">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      {majorCount} ngành đào tạo
                    </p>
                    {fac.Majors && fac.Majors.length > 0 && (
                      <div className="space-y-1">
                        {fac.Majors.slice(0, 3).map((m) => (
                          <div key={m.id} className="flex items-center gap-2 text-[11px] text-slate-500">
                            <CheckCircle className="w-3 h-3 text-secondary shrink-0" />
                            <span className="truncate">{m.name}</span>
                          </div>
                        ))}
                        {majorCount > 3 && (
                          <p className="text-[10px] text-primary font-bold mt-1">
                            +{majorCount - 3} ngành khác
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-end text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Xem chi tiết <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* ──────────────── LATEST NEWS SECTION ──────────────── */
function LatestNewsSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService.getPublishedPosts({ page: 1, limit: 6 })
      .then((data) => setPosts(data.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || posts.length === 0) return null;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  return (
    <section className="bg-background-light py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
              Cập nhật
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tin tức mới nhất
            </h2>
          </div>
          <Link
            to="/tin-tuc"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline shrink-0"
          >
            Xem tất cả tin tức <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/tin-tuc/${post.slug || post.id}`}
              className="group bg-white border border-slate-100 hover:border-primary transition-colors"
            >
              {post.image_url ? (
                <div className="h-44 overflow-hidden bg-slate-100">
                  <img 
                    src={post.image_url.startsWith('http') ? post.image_url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${post.image_url}`} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              ) : (
                <div className="h-44 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Newspaper className="w-8 h-8 text-primary/30" />
                </div>
              )}
              <div className="p-5">
                {post.Category && (
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wide">{post.Category.name}</span>
                )}
                <h3 className="text-sm font-bold text-slate-900 mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <CalendarDays className="w-3 h-3" />
                  {fmtDate(post.published_at || post.createdAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────── WHY DUE SECTION ──────────────── */
function WhyDUESection() {
  const reasons = [
    {
      icon: Award,
      title: 'Uy tín hàng đầu khu vực miền Trung',
      desc: 'Được thành lập từ năm 1969, Trường ĐH Kinh tế là thành viên của ĐH Đà Nẵng — một trong những đại học trọng điểm quốc gia.',
    },
    {
      icon: BookOpen,
      title: 'Chương trình đào tạo đa dạng',
      desc: 'Đào tạo các bậc Cử nhân, Thạc sĩ, Tiến sĩ với nhiều ngành nghề thuộc lĩnh vực Kinh tế, Kinh doanh, Quản lý và Công nghệ.',
    },
    {
      icon: Users,
      title: 'Đội ngũ giảng viên chất lượng cao',
      desc: 'Hơn 70% giảng viên có trình độ Tiến sĩ, nhiều người được đào tạo tại các trường đại học danh tiếng trên thế giới.',
    },
    {
      icon: TrendingUp,
      title: 'Tỷ lệ có việc làm cao',
      desc: 'Hơn 95% sinh viên có việc làm phù hợp trong vòng 1 năm sau khi tốt nghiệp, với mức lương cạnh tranh.',
    },
    {
      icon: Building2,
      title: 'Cơ sở vật chất hiện đại',
      desc: 'Khuôn viên rộng rãi với các phòng học thông minh, thư viện số, phòng lab máy tính và không gian sáng tạo cho sinh viên.',
    },
    {
      icon: Star,
      title: 'Kết nối doanh nghiệp mạnh mẽ',
      desc: 'Hợp tác chặt chẽ với hàng trăm doanh nghiệp trong và ngoài nước, tạo cơ hội thực tập và việc làm cho sinh viên.',
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
            Vì sao chọn chúng tôi
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Tại sao chọn Đại học Kinh tế?
          </h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            Với hơn 55 năm kinh nghiệm đào tạo, DUE là sự lựa chọn hàng đầu cho
            hành trình phát triển sự nghiệp của bạn.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{r.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────── CONTACT INFO + CTA ──────────────── */
function ContactCTASection() {
  return (
    <section className="relative bg-slate-900 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Left — CTA */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Sẵn sàng cho hành trình mới?
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed mx-auto max-w-xl">
              Tìm hiểu thông tin tuyển sinh chi tiết tại Đại học Kinh tế — Đại học Đà Nẵng. 
              Chúng tôi luôn sẵn sàng hỗ trợ và đồng hành cùng bạn.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/nganh-dao-tao"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold px-8 py-3.5 text-sm hover:bg-slate-100 transition-colors rounded-xl"
              >
                Xem ngành đào tạo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/lien-he"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-3.5 text-sm hover:bg-white/10 transition-colors rounded-xl"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── PAGE ──────────────── */
export default function HomePage() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    // We fetch all active banners at 'main_top' position for the home page.
    // This ensures that any banner created in the admin panel showing up.
    bannerService.getBanners({ is_active: true, position: 'main_top' })
      .then((data) => setBanners(Array.isArray(data) ? data : data?.data || []))
      .catch(() => setBanners([]));
  }, []);

  return (
    <>
      <HeroSection banners={banners} />
      <QuickToolsSection />
      <FacultiesSection />
      <WhyDUESection />
      <LatestNewsSection />
      <ContactCTASection />
    </>
  );
}
