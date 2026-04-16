import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Youtube,
  ArrowUpRight,
  GraduationCap,
} from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import LogoDUE from '../assets/Logo_DUE.jpg';

const quickLinks = [
  { label: 'Giới thiệu', to: '/gioi-thieu' },
  { label: 'Ngành đào tạo', to: '/nganh-dao-tao' },
  { label: 'Phương thức xét tuyển', to: '/phuong-thuc-xet-tuyen' },
  { label: 'Tra cứu điểm chuẩn', to: '/tra-cuu-diem-chuan' },
  { label: 'Học bổng tuyển sinh', to: '/hoc-bong-chinh-sach' },
];

const admissionLinks = [
  { label: 'Chỉ tiêu tuyển sinh', to: '/chi-tieu-tuyen-sinh' },
  { label: 'Hỏi đáp FAQ', to: '/hoi-dap-faq' },
  { 
    label: 'Tư vấn trực tuyến AI', 
    onClick: (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('open-chat'));
    }
  },
  { label: 'Tin tức & Sự kiện', to: '/tin-tuc' },
];

export default function Footer() {
  const { config } = useConfig();
  const currentYear = new Date().getFullYear();
  const universityName = config.university_name || 'Trường Đại học Kinh tế — Đại học Đà Nẵng';
  const address = config.address || '71 Ngũ Hành Sơn, Q. Ngũ Hành Sơn, TP. Đà Nẵng';
  const phone = config.hotline || '0236 3836 169';
  const email = config.email || 'tuyensinh@due.udn.vn';

  return (
    <footer className="bg-blue-950 text-white/80 border-t border-white/5">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1 — Brand */}
        <div>
          <div className="flex items-center gap-3 mb-6 group">
            <img src={LogoDUE} alt="Logo DUE" className="w-12 h-12 object-contain transition-transform group-hover:scale-105 rounded-xl shadow-lg border border-white/10" />
            <div>
              <p className="text-white font-black text-base leading-tight tracking-tight uppercase">
                ĐẠI HỌC KINH TẾ
              </p>
              <p className="text-white/60 text-[10px] font-bold leading-tight tracking-[0.1em] uppercase mt-1">
                ĐẠI HỌC ĐÀ NẴNG
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed mb-5">
            Cổng thông tin tuyển sinh chính thức — hỗ trợ thí sinh tra cứu và tư vấn tuyển sinh.
          </p>
          <div className="flex gap-3">
            <a
              href="https://facebook.com/tuyensinh.due"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors rounded-xl"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors rounded-xl"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://due.udn.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors rounded-xl"
              aria-label="Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Col 2 — Quick links */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
            Liên kết nhanh
          </h4>
          <ul className="space-y-2.5">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm hover:text-primary transition-colors flex items-center gap-1.5 group"
                >
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Admission links */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
            Tuyển sinh
          </h4>
          <ul className="space-y-2.5">
            {admissionLinks.map((l) => (
              <li key={l.label}>
                {l.to ? (
                  <Link
                    to={l.to}
                    className="text-sm hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.label}
                  </Link>
                ) : (
                  <button
                    onClick={l.onClick}
                    className="text-sm hover:text-primary transition-colors flex items-center gap-1.5 group text-left w-full"
                  >
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Contact */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
            Liên hệ
          </h4>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-white/60" />
              <span>{address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="w-4 h-4 mt-0.5 shrink-0 text-white/60" />
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                {phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="w-4 h-4 mt-0.5 shrink-0 text-white/60" />
              <a
                href={`mailto:${email}`}
                className="hover:text-primary transition-colors"
              >
                {email}
              </a>
            </li>
            <li className="flex gap-3">
              <Globe className="w-4 h-4 mt-0.5 shrink-0 text-white/60" />
              <a
                href="https://due.udn.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                due.udn.vn
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <span>© {currentYear} {universityName}. All rights reserved.</span>
          <span>
            Thiết kế &amp; phát triển bởi{' '}
            <span className="text-white/70 font-medium">DUE Admissions Tech</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
