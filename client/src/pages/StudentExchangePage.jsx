import { Users, Globe, Calendar, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const benefits = [
  'Trải nghiệm học tập tại môi trường quốc tế',
  'Nâng cao kỹ năng ngoại ngữ và giao tiếp',
  'Mở rộng mạng lưới quan hệ quốc tế',
  'Tích luỹ tín chỉ được công nhận tại DUE',
  'Nhận hỗ trợ học bổng và chi phí sinh hoạt',
  'Phát triển tư duy đa văn hoá',
];

const programs = [
  { dest: 'Nhật Bản', duration: '6 tháng', time: 'Tháng 3 - Tháng 8', desc: 'Trao đổi tại các đại học đối tác Nhật Bản, bao gồm nghiên cứu và thực tập.', flag: '🇯🇵' },
  { dest: 'Hàn Quốc', duration: '1 học kỳ', time: 'Tháng 9 - Tháng 1', desc: 'Chương trình trao đổi với Đại học Chungnam và các đối tác Hàn Quốc.', flag: '🇰🇷' },
  { dest: 'Đài Loan', duration: '1 học kỳ', time: 'Tháng 2 - Tháng 6', desc: 'Học tập và nghiên cứu tại Đại học Quốc gia Thành Công.', flag: '🇹🇼' },
  { dest: 'Đức', duration: '1 năm', time: 'Tháng 10 - Tháng 7', desc: 'Chương trình trao đổi nghiên cứu tại Đại học Kỹ thuật Dresden.', flag: '🇩🇪' },
];

export default function StudentExchangePage() {
  return (
    <div>
      <PageHeader
        title="Trao đổi sinh viên"
        subtitle="Cơ hội học tập và trải nghiệm tại nước ngoài"
        breadcrumbs={[{ label: 'Chương trình', to: '/nganh-dao-tao' }, { label: 'Trao đổi sinh viên' }]}
      />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 mb-4 inline-block">LỢI ÍCH</span>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Tại sao nên tham gia trao đổi sinh viên?</h2>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-8">
            <Globe className="w-10 h-10 mb-4 opacity-60" />
            <h3 className="text-lg font-bold mb-2">Điều kiện tham gia</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• Sinh viên chính quy từ năm 2 trở lên</li>
              <li>• GPA tích luỹ ≥ 2.5/4.0</li>
              <li>• Chứng chỉ ngoại ngữ phù hợp (IELTS, JLPT, TOPIK...)</li>
              <li>• Không vi phạm kỷ luật học tập</li>
              <li>• Cam kết hoàn thành chương trình trao đổi</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-xl font-black text-slate-900 mb-6">Chương trình trao đổi hiện tại</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {programs.map((p, i) => (
              <div key={i} className="bg-white border border-slate-100 p-6 rounded-xl hover:border-primary transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{p.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{p.dest}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.duration}</span>
                      <span>{p.time}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Sẵn sàng khám phá thế giới?</h2>
        <p className="text-sm text-slate-500 mb-6">Liên hệ phòng Hợp tác Quốc tế hoặc đặt câu hỏi qua tư vấn AI</p>
        <div className="flex justify-center gap-3">
          <Link to="/lien-he" className="bg-primary text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-primary-light transition-colors">
            Liên hệ
          </Link>
          <Link to="/tu-van-truc-tuyen" className="border border-primary text-primary text-sm font-semibold px-6 py-3 rounded-xl hover:bg-primary/5 transition-colors">
            Tư vấn AI
          </Link>
        </div>
      </section>
    </div>
  );
}
