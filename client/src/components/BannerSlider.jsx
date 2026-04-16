import { useState, useEffect, useRef } from 'react';
import { bannerService } from '../services';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BannerSlider({ facultyId }) {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    bannerService.getBanners({ 
      is_active: true, 
      position: 'hero',
      faculty_id: facultyId || 'null' // 'null' means global banners in my controller logic typically, or just undefined
    })
      .then((data) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => setBanners([]));
  }, [facultyId]);

  useEffect(() => {
    if (banners.length > 1) {
      intervalRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % banners.length);
      }, 5000);
      return () => clearInterval(intervalRef.current);
    }
  }, [banners]);

  if (banners.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + banners.length) % banners.length);
  const next = () => setIndex((i) => (i + 1) % banners.length);

  const banner = banners[index];

  return (
    <div className="relative w-full overflow-hidden">
      <a href={banner.link_url || '#'} target="_blank" rel="noopener noreferrer">
        <img src={banner.image_url} alt={banner.title} className="w-full h-auto object-cover" />
      </a>
      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 w-full flex justify-center gap-2">
            {banners.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
