import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import api from '../services/api';

export default function PageHeader({ title, subtitle, breadcrumbs = [] }) {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    api.get('/banners', { params: { is_active: true, position: 'hero', faculty_id: 'null' } })
      .then(r => setBanners(Array.isArray(r.data) ? r.data : []))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setIndex(i => (i + 1) % banners.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const activeBanner = banners.length > 0 ? banners[index] : null;

  return (
    <section className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background Banner */}
      {activeBanner && (
        <img 
          src={activeBanner.image_url} 
          alt={activeBanner.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-30 transition-opacity duration-1000"
          key={activeBanner.image_url}
        />
      )}
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary-light/10 rounded-full blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-4">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" />
              Trang chủ
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-white/30" />
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-white transition-colors">{crumb.label}</Link>
                ) : (
                  <span className="text-white/90">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-white/60 text-sm max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}
