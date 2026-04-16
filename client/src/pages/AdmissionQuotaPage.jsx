import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ArrowRight, BookOpen, Building2, ChevronRight,
  ChevronDown, TrendingUp, BarChart3, Target, Calendar, Award,
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) {
    return url;
  }
  return `${BACKEND_URL}${url}`;
};

/* ──────────────── HERO ──────────────── */
function HeroSection() {
  return (
    <section className="relative bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rotate-45" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-primary-light/10 rotate-12" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-14 lg:py-20">
        <div className="flex items-center gap-2 text-xs text-white/50 mb-8">
          <Link to="/" className="hover:text-white/80 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/80">Chỉ tiêu tuyển sinh</span>
        </div>

        <div className="max-w-3xl">
          <span className="inline-block bg-white/10 text-white/90 text-[10px] font-bold px-3 py-1 mb-4 uppercase tracking-widest border border-white/10 rounded-xl">
            Thông tin tuyển sinh
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-5">
            Chỉ tiêu
            <br />
            <span className="text-primary-light">Tuyển sinh chính thức</span>
          </h1>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl">
            Tra cứu văn bản và sơ đồ chỉ tiêu tuyển sinh của Trường Đại học Kinh tế — Đại học Đà Nẵng qua các năm.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── POST CARD ──────────────── */
function QuotaPostCard({ post }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all mb-10 group">
      <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-wider">
              Chỉ tiêu
            </span>
            {post.year && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                 Năm {post.year}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
            {post.name}
          </h3>
        </div>
      </div>

      <div className="w-full bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 gap-6">
        {(() => {
          const allImages = post.image_urls && post.image_urls.length > 0
            ? post.image_urls 
            : (post.image_url ? [post.image_url] : []);
            
          if (allImages.length === 0) {
            return (
              <div className="py-20 flex flex-col items-center justify-center text-slate-300 w-full">
                <Target className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-medium">Đang cập nhật hình ảnh...</p>
              </div>
            );
          }
          
          return allImages.map((url, idx) => (
            <img 
              key={idx}
              src={getImageUrl(url)} 
              alt={`${post.name} - Ảnh ${idx + 1}`} 
              className="w-full max-w-5xl h-auto object-contain rounded-xl shadow-lg border border-slate-200 bg-white"
              loading="lazy"
            />
          ));
        })()}
      </div>
    </div>
  );
}

/* ──────────────── MAIN PAGE ──────────────── */
export default function AdmissionQuotaPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admission-methods', { params: { type: 'quota', limit: 100 } });
        const allPosts = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setPosts(allPosts.filter(p => p.is_public));
      } catch (err) {
        setError('Không thể tải dữ liệu chỉ tiêu');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const years = useMemo(() => {
    const y = [...new Set(posts.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
    return y;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!selectedYear) return posts;
    return posts.filter(p => p.year === parseInt(selectedYear));
  }, [posts, selectedYear]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="bg-slate-50 min-h-screen">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Year Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-xl shadow-inner">
               <Calendar className="w-5 h-5 text-primary" />
             </div>
             <div>
               <h2 className="text-base font-black text-slate-900">Lọc theo năm</h2>
               <p className="text-[11px] text-slate-500 font-medium">Xem kế hoạch tuyển sinh các năm trước</p>
             </div>
          </div>
          <div className="relative w-full sm:w-48">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-primary appearance-none cursor-pointer font-bold text-slate-700"
            >
              <option value="">Tất cả các năm</option>
              {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Post List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 py-24 rounded-3xl text-center shadow-inner">
            <Target className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-base text-slate-500 font-bold uppercase tracking-wider">Chưa có thông báo chỉ tiêu</p>
            <p className="text-sm text-slate-400 mt-2">Dữ liệu sẽ được cập nhật sớm nhất có thể</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <QuotaPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Related Actions */}
      <section className="bg-slate-900 mt-10">
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-3xl font-black text-white leading-tight">
              Tìm hiểu thêm về <br/><span className="text-primary-light">Quy trình Tuyển sinh</span>
            </h2>
            <p className="mt-4 text-white/60 max-w-lg text-sm font-medium">
              Ngoài chỉ tiêu, bạn có thể xem thêm về phương thức xét tuyển và tra cứu điểm chuẩn của các năm trước.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/phuong-thuc-xet-tuyen" className="px-8 py-3.5 bg-white text-primary font-black rounded-xl hover:bg-slate-50 transition-all text-sm shadow-xl shadow-white/5">
              Phương thức xét tuyển
            </Link>
            <Link to="/tra-cuu-diem-chuan" className="px-8 py-3.5 border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm">
              Tra cứu điểm chuẩn
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
