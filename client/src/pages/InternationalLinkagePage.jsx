import { Globe, ExternalLink, Award, Users, BookOpen, MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const partners = [
  { name: 'Đại học Tokyo', country: 'Nhật Bản', type: 'Nghiên cứu & Trao đổi', flag: '🇯🇵' },
  { name: 'Đại học Chungnam', country: 'Hàn Quốc', type: 'Chuyển tiếp & Trao đổi', flag: '🇰🇷' },
  { name: 'Đại học Kỹ thuật Dresden', country: 'Đức', type: 'Nghiên cứu chung', flag: '🇩🇪' },
  { name: 'Đại học Quốc gia Thành Công', country: 'Đài Loan', type: 'Chuyển tiếp 2+2', flag: '🇹🇼' },
  { name: 'Đại học Griffith', country: 'Úc', type: 'Học bổng & Trao đổi', flag: '🇦🇺' },
  { name: 'Đại học Bách khoa Lappeenranta', country: 'Phần Lan', type: 'Nghiên cứu & Đào tạo', flag: '🇫🇮' },
];

const programs = [
  { title: 'Chương trình chuyển tiếp 2+2', desc: 'Sinh viên học 2 năm tại DUE và 2 năm tại đại học đối tác, nhận bằng của cả hai trường.', icon: Award },
  { title: 'Chương trình liên kết đào tạo', desc: 'Đào tạo theo chương trình quốc tế với sự tham gia giảng dạy của giảng viên nước ngoài.', icon: BookOpen },
  { title: 'Trao đổi sinh viên', desc: 'Sinh viên có cơ hội học tập 1-2 học kỳ tại các trường đối tác quốc tế.', icon: Users },
];

export default function InternationalLinkagePage() {
  return (
    <div>
      <PageHeader
        title="Liên kết quốc tế"
        subtitle="Chương trình hợp tác đào tạo với các đối tác quốc tế"
        breadcrumbs={[{ label: 'Chương trình', to: '/nganh-dao-tao' }, { label: 'Liên kết quốc tế' }]}
      />

      {/* Programs */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-black text-slate-900 mb-6">Chương trình hợp tác</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((p, i) => (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-xl hover:border-primary transition-colors group">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                <p.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{p.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Đối tác quốc tế
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((p, i) => (
              <div key={i} className="bg-white border border-slate-100 p-5 rounded-xl flex items-start gap-4 hover:border-primary transition-colors">
                <span className="text-2xl">{p.flag}</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {p.country}
                  </p>
                  <span className="inline-block bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 mt-2">
                    {p.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Bạn quan tâm đến chương trình quốc tế?</h2>
        <p className="text-sm text-slate-500 mb-6">Liên hệ Phòng Hợp tác Quốc tế để được tư vấn chi tiết</p>
        <a href="/lien-he" className="inline-block bg-primary text-white text-sm font-semibold px-8 py-3 rounded-xl hover:bg-primary-light transition-colors">
          Liên hệ ngay
        </a>
      </section>
    </div>
  );
}
