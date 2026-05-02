import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, Award, Globe, BookOpen, Phone, MapPin, Mail,
  GraduationCap, TrendingUp, Star, CheckCircle, ArrowRight,
  ChevronRight, Clock, Briefcase, Target, Heart, Lightbulb,
} from 'lucide-react';
import { getFaculties } from '../services/facultyService';
import PageHeader from '../components/PageHeader';

/* ──────────────── HISTORY TIMELINE ──────────────── */
const milestones = [
  { 
    year: '1975', 
    event: 'Ngày 11/7/1975, Viện Đại học Đà Nẵng chính thức được thành lập, mở ra chương đầu tiên của giáo dục đại học khu vực miền Trung.' 
  },
  { 
    year: '1976', 
    event: 'Khai giảng khóa đầu tiên (29/3/1976) khẳng định sự hiện diện chính thức của Khoa Kinh tế - tiền thân của DUE ngày nay.' 
  },
  { 
    year: '1985', 
    event: 'Thành lập Phân hiệu Đại học Kinh tế Đà Nẵng tại Mỹ An, đặt viên gạch đầu tiên cho sự lớn mạnh sau này.' 
  },
  { 
    year: '1994', 
    event: 'Thành lập Trường ĐH Kinh tế và Quản trị Kinh doanh, chính thức trở thành trường thành viên chủ lực của Đại học Đà Nẵng.' 
  },
  { 
    year: '2004', 
    event: 'Đổi tên thành Trường Đại học Kinh tế - Đại học Đà Nẵng, định vị thương hiệu học thuật rõ ràng trong nước và quốc tế.' 
  },
  { 
    year: '2015', 
    event: 'Đón nhận Huân chương Lao động hạng Nhất và thực hiện hiện đại hóa mạnh mẽ về quản trị và kiểm định quốc tế.' 
  },
  { 
    year: '2025', 
    event: 'Kỷ niệm 50 năm hành trình kiến tạo tri thức, hướng tới trở thành đại học nghiên cứu hàng đầu thế giới.' 
  },
];

/* ──────────────── CORE VALUES ──────────────── */
const coreValues = [
  {
    icon: Target,
    title: 'Sứ mệnh',
    desc: 'Tạo dựng môi trường học thuật tiên tiến và nhân văn, thúc đẩy khám phá và chuyển giao tri thức, nuôi dưỡng và phát triển tài năng, bản lĩnh và tinh thần phụng sự cộng đồng.',
    color: 'bg-blue-600',
  },
  {
    icon: Lightbulb,
    title: 'Tầm nhìn',
    desc: 'Trở thành trường đại học nghiên cứu hàng đầu khu vực, tiên phong khám phá và chuyển giao tri thức, khẳng định vị thế trên bản đồ giáo dục đại học thế giới.',
    color: 'bg-emerald-600',
  },
  {
    icon: Heart,
    title: 'Giá trị cốt lõi',
    desc: 'Học thuật — Trách nhiệm — Đổi mới — Phục vụ cộng đồng. DUE lấy người học làm trung tâm, gắn kết đào tạo với thực tiễn và hội nhập quốc tế sâu rộng.',
    color: 'bg-violet-600',
  },
];

/* ──────────────── LEADERSHIP AREAS ──────────────── */
const strengths = [
  {
    icon: BookOpen,
    title: 'Chương trình đào tạo tiên tiến',
    desc: 'Chương trình cập nhật theo chuẩn quốc tế, được kiểm định bởi các tổ chức uy tín trong và ngoài nước.',
  },
  {
    icon: Users,
    title: 'Đội ngũ giảng viên chất lượng',
    desc: 'Hơn 70% giảng viên có trình độ Tiến sĩ, nhiều người được đào tạo tại các đại học danh tiếng thế giới.',
  },
  {
    icon: Globe,
    title: 'Hợp tác quốc tế rộng mở',
    desc: 'Liên kết đào tạo và trao đổi sinh viên với hơn 30 trường đại học từ Nhật Bản, Hàn Quốc, Úc, Pháp, Mỹ...',
  },
  {
    icon: Briefcase,
    title: 'Kết nối doanh nghiệp chặt chẽ',
    desc: 'Hợp tác với hàng trăm doanh nghiệp, tạo cơ hội thực tập, việc làm và nghiên cứu ứng dụng cho sinh viên.',
  },
  {
    icon: TrendingUp,
    title: 'Tỷ lệ việc làm vượt trội',
    desc: 'Hơn 95% sinh viên có việc làm phù hợp trong vòng 1 năm sau tốt nghiệp, với mức thu nhập cạnh tranh.',
  },
  {
    icon: Star,
    title: 'Nghiên cứu khoa học nổi bật',
    desc: 'Nhiều đề tài cấp Nhà nước, bài báo quốc tế, và dự án chuyển giao công nghệ cho doanh nghiệp và địa phương.',
  },
];

/* ──────────────── CONTACT INFO ──────────────── */
const contactInfo = [
  { icon: MapPin, label: 'Địa chỉ', value: '71 Ngũ Hành Sơn, Quận Ngũ Hành Sơn, TP. Đà Nẵng' },
  { icon: Phone, label: 'Điện thoại', value: '0236 3836 169' },
  { icon: Mail, label: 'Email', value: 'dhkt@due.edu.vn' },
  { icon: Globe, label: 'Website', value: 'due.udn.vn' },
];

/* ──────────────── ABOUT PAGE ──────────────── */
export default function AboutPage() {
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    getFaculties()
      .then((data) => setFaculties(Array.isArray(data) ? data : data?.data || []))
      .catch(() => setFaculties([]));
  }, []);

  const totalMajors = faculties.reduce((sum, f) => sum + (f.Majors?.length || 0), 0);

  const stats = [
    { icon: Building2, value: `${faculties.length || '8'}`, label: 'Khoa đào tạo' },
    { icon: GraduationCap, value: `${totalMajors || '30+'}`, label: 'Ngành đào tạo' },
    { icon: Users, value: '15,000+', label: 'Sinh viên' },
    { icon: Award, value: '50+', label: 'Năm xây dựng' },
    { icon: Globe, value: '30+', label: 'Đối tác quốc tế' },
    { icon: TrendingUp, value: '95%', label: 'Có việc làm sau 1 năm' },
  ];

  return (
    <div>
      <PageHeader
        title="Giới thiệu"
        subtitle="Tìm hiểu về Trường Đại học Kinh tế — Đại học Đà Nẵng (DUE)"
        breadcrumbs={[{ label: 'Giới thiệu' }]}
      />

      {/* ── Introduction ── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 mb-4 inline-block uppercase tracking-wider rounded-xl">
              Về chúng tôi
            </span>
            <h2 className="text-3xl font-black text-slate-900 mb-5 leading-tight">
              Trường Đại học Kinh tế
              <br />
              <span className="text-primary">Đại học Đà Nẵng</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4 italic border-l-4 border-primary pl-4 py-2 bg-slate-50 rounded-r-lg font-medium">
              "Những dấu mốc đầu tiên không chỉ ghi nhận sự ra đời của một cơ sở giáo dục đại học, mà còn mở ra hành trình nửa thế kỷ kiến tạo tri thức của một học hiệu mang khát vọng Việt Nam và tầm nhìn quốc tế."
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Khởi nguyên từ năm 1975, ngay sau ngày đất nước thống nhất, Khoa Kinh tế đã nhanh chóng định hình sứ mệnh đào tạo nguồn nhân lực chất lượng cao cho miền Trung — Tây Nguyên và cả nước. Trải qua 50 năm, DUE đã vươn mình mạnh mẽ từ những lớp học đơn sơ những ngày đầu giải phóng để trở thành một đại học nghiên cứu hàng đầu.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Với phương châm <em className="font-semibold text-primary">"Học thuật — Trách nhiệm — Đổi mới — Phục vụ cộng đồng"</em>, DUE không ngừng tiên phong trong đổi mới sáng tạo, kiểm định quốc tế và chuyển giao tri thức, hướng tới mục tiêu đại học bền vững và khẳng định vị thế Việt Nam trên bản đồ giáo dục thế giới.
            </p>
          </div>

          {/* Right - Quick facts card */}
          <div className="bg-slate-900 p-8 text-white rounded-xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <BookOpen className="w-10 h-10 mb-4 opacity-60" />
            <h3 className="text-lg font-bold mb-4">Truyền thống & Đổi mới</h3>
            <p className="text-sm text-white/80 leading-relaxed mb-6">
              Kế thừa truyền thống hơn 55 năm xây dựng và phát triển, Trường Đại học Kinh tế không ngừng
              đổi mới chương trình đào tạo, ứng dụng công nghệ tiên tiến, hướng tới đạt chuẩn kiểm định
              quốc tế và đào tạo nguồn nhân lực chất lượng cao cho đất nước.
            </p>
            <div className="space-y-2.5">
              {contactInfo.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex items-center gap-2.5 text-sm text-white/80">
                    <Icon className="w-4 h-4 text-white/50 shrink-0" />
                    <span>{c.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="text-center">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mx-auto mb-3 rounded-xl">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Mission / Vision / Values ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Triết lý</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Sứ mệnh & Tầm nhìn
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {coreValues.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="bg-white border border-slate-100 p-7 hover:border-primary transition-colors group rounded-xl">
                <div className={`w-12 h-12 ${v.color} flex items-center justify-center mb-5 rounded-xl`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-3">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── History Timeline ── */}
      <section className="bg-background-light border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Lịch sử</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Dấu mốc phát triển
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 hidden sm:block" />

            <div className="space-y-6">
              {milestones.map((m, i) => (
                <div key={m.year} className="flex gap-6 items-start group">
                  <div className="relative shrink-0 z-10">
                    <div className="w-12 h-12 bg-primary text-white flex items-center justify-center font-bold text-xs rounded-xl">
                      {m.year}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 p-5 flex-1 group-hover:border-primary transition-colors rounded-xl">
                    <p className="text-sm text-slate-700 leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Strengths ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Thế mạnh</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Điểm nổi bật của DUE
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {strengths.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0 rounded-xl">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Faculties ── */}
      {faculties.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Đào tạo</p>
                <h2 className="text-2xl font-black text-slate-900">Các Khoa trực thuộc</h2>
              </div>
              <Link to="/he-chinh-quy" className="text-xs font-bold text-primary hover:underline hidden sm:flex items-center gap-1">
                Xem chương trình đào tạo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {faculties.map((fac) => {
                const majorCount = fac.Majors?.length || 0;
                return (
                  <Link
                    key={fac.id}
                    to={`/khoa/${fac.slug || fac.id}`}
                    className="bg-white border border-slate-100 p-5 hover:border-primary transition-all group rounded-xl shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden border border-slate-100 group-hover:border-primary transition-all bg-white flex items-center justify-center">
                        {fac.logo_url ? (
                          <img 
                            src={fac.logo_url.startsWith('http') ? fac.logo_url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${fac.logo_url}`} 
                            alt={fac.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center group-hover:bg-primary transition-colors">
                            <Building2 className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight mb-0.5 truncate">
                          {fac.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {majorCount} ngành đào tạo
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="bg-slate-900 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white tracking-tight mb-4">
              Tham gia cộng đồng DUE
            </h2>
            <p className="text-white/70 max-w-lg mx-auto mb-8">
              Khám phá chương trình đào tạo chất lượng cao và bắt đầu hành trình
              xây dựng sự nghiệp cùng Trường Đại học Kinh tế — Đại học Đà Nẵng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/lien-he"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-3.5 text-sm hover:bg-white/10 transition-colors rounded-xl"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
