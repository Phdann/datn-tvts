import { Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Clock, Calendar, Briefcase, Users,
  CheckCircle, ArrowRight, MapPin, Phone, Award, TrendingUp,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function HeVuaLamVuaHocPage() {
  const highlights = [
    { icon: Clock, label: 'Thời gian đào tạo', value: '4.5 — 5 năm' },
    { icon: GraduationCap, label: 'Bằng cấp', value: 'Cử nhân (tương đương chính quy)' },
    { icon: Calendar, label: 'Lịch học', value: 'Tối & cuối tuần' },
    { icon: Briefcase, label: 'Đối tượng', value: 'Người đang đi làm' },
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Lịch học linh hoạt',
      desc: 'Học vào buổi tối (từ 17h30) và cuối tuần, phù hợp với người đang đi làm hoặc có lịch trình bận rộn.',
    },
    {
      icon: Award,
      title: 'Bằng cấp có giá trị tương đương',
      desc: 'Bằng Cử nhân do Đại học Đà Nẵng cấp, có giá trị pháp lý và thực tiễn tương đương bằng hệ chính quy.',
    },
    {
      icon: TrendingUp,
      title: 'Nâng cao năng lực nghề nghiệp',
      desc: 'Cập nhật kiến thức chuyên sâu, mở rộng cơ hội thăng tiến và chuyển đổi nghề nghiệp.',
    },
    {
      icon: Users,
      title: 'Mạng lưới chuyên gia',
      desc: 'Học cùng những người đã có kinh nghiệm thực tiễn, xây dựng mạng lưới quan hệ nghề nghiệp rộng lớn.',
    },
    {
      icon: BookOpen,
      title: 'Chương trình thiết kế riêng',
      desc: 'Nội dung chương trình được điều chỉnh để phù hợp với người đi làm, tập trung vào ứng dụng thực tế.',
    },
    {
      icon: MapPin,
      title: 'Học tại Đà Nẵng',
      desc: 'Học tập trung tại khuôn viên Trường ĐH Kinh tế, thuận tiện cho người đang sinh sống và làm việc tại khu vực.',
    },
  ];

  const majors = [
    { name: 'Quản trị Kinh doanh', code: '7340101' },
    { name: 'Kế toán', code: '7340301' },
    { name: 'Tài chính — Ngân hàng', code: '7340201' },
    { name: 'Kinh tế', code: '7310101' },
    { name: 'Luật Kinh tế', code: '7380107' },
    { name: 'Quản trị Nhân lực', code: '7340404' },
  ];

  const requirements = [
    'Tốt nghiệp THPT hoặc tương đương',
    'Đang đi làm hoặc có nhu cầu vừa làm vừa học',
    'Đạt yêu cầu theo quy định tuyển sinh của Bộ GD&ĐT và Đại học Đà Nẵng',
    'Hoàn thành hồ sơ đăng ký theo quy định',
  ];

  return (
    <div>
      <PageHeader
        title="Hệ Vừa Làm Vừa Học"
        subtitle="Chương trình đào tạo linh hoạt dành cho người đang đi làm"
        breadcrumbs={[{ label: 'Chương trình', to: '/' }, { label: 'Hệ vừa làm vừa học' }]}
      />

      {/* Overview */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 mb-4 inline-block uppercase tracking-wider">
              Tổng quan
            </span>
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              Học đại học không cần nghỉ việc
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Hệ vừa làm vừa học (VLVH) là chương trình đào tạo đại học dành cho những người đang đi làm, mong muốn
              nâng cao trình độ chuyên môn mà không cần thôi việc. Lịch học được bố trí vào buổi tối và cuối tuần,
              tạo điều kiện tối đa cho người học.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Chương trình có nội dung tương tương đương với hệ chính quy, được giảng dạy bởi cùng đội ngũ giảng viên.
              Sau khi tốt nghiệp, sinh viên nhận bằng Cử nhân do Đại học Đà Nẵng cấp, có giá trị tương đương
              bằng hệ chính quy theo quy định pháp luật.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Trường Đại học Kinh tế — Đại học Đà Nẵng tổ chức tuyển sinh hệ VLVH hàng năm, với quy trình
              đăng ký thuận tiện và thủ tục đơn giản.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.label} className="bg-slate-50 border border-slate-100 p-5 rounded-lg">
                  <Icon className="w-5 h-5 text-primary mb-3" />
                  <p className="text-xs text-slate-400 mb-1">{h.label}</p>
                  <p className="text-sm font-bold text-slate-900">{h.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-background-light border-y border-slate-100 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Ưu điểm</p>
            <h2 className="text-2xl font-black text-slate-900">Tại sao chọn hệ vừa làm vừa học?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-white border border-slate-100 p-6 rounded-xl hover:border-primary transition-colors group">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    <Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Majors */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-black text-slate-900 mb-2">Ngành đào tạo hệ VLVH</h2>
        <p className="text-sm text-slate-500 mb-6">Các ngành tuyển sinh phổ biến (danh sách có thể thay đổi theo từng năm)</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {majors.map((m) => (
            <div key={m.code} className="flex items-center gap-3 bg-white border border-slate-100 px-5 py-4 rounded-lg hover:border-primary transition-colors">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900">{m.name}</p>
                <p className="text-[11px] text-slate-400">Mã ngành: {m.code}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-slate-50 border-y border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-black text-slate-900 mb-6">Điều kiện xét tuyển</h2>
          <div className="bg-white border border-slate-100 p-6 space-y-3 rounded-xl">
            {requirements.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-xs mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-700">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact info */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">Thông tin liên hệ tuyển sinh VLVH</h2>
            <p className="text-sm text-slate-500 mb-6">
              Để biết thêm chi tiết về lịch tuyển sinh, học phí và hồ sơ đăng ký, vui lòng liên hệ:
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                Phòng Đào tạo — 71 Ngũ Hành Sơn, TP. Đà Nẵng
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                Hotline: <strong>0236 3836 169</strong>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                Giờ tiếp nhận: T2 — T6 (7h30 — 17h00), T7 (7h30 — 11h30)
              </p>
            </div>
          </div>
          <div className="bg-primary text-white p-8">
            <h3 className="text-lg font-bold mb-3">Đăng ký tư vấn</h3>
            <p className="text-sm text-white/70 mb-6">
              Để lại thông tin, chúng tôi sẽ liên hệ tư vấn chi tiết về chương trình đào tạo hệ VLVH.
            </p>
            <Link
              to="/lien-he"
              className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 text-sm hover:bg-slate-100 transition-colors"
            >
              Liên hệ ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
