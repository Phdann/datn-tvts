import { Phone, Mail, MapPin, Clock, Facebook, Youtube, ExternalLink } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="bg-slate-900 text-white/90 text-xs hidden md:block">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">
      
        <div className="flex items-center gap-5">
          <a
            href="tel:02363836169"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>0236 3836 169</span>
          </a>
          <a
            href="mailto:tuyensinh@due.udn.vn"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="w-3 h-3" />
            <span>tuyensinh@due.udn.vn</span>
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            <span>71 Ngũ Hành Sơn, Đà Nẵng</span>
          </span>
        </div>

       
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>T2 – T7: 7:30 – 17:00</span>
          </span>

          <span className="w-px h-3.5 bg-white/30" />

          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com/tuyensinh.due"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://due.udn.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>due.udn.vn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
