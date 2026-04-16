import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, FileText, ChevronRight, Info } from 'lucide-react';
import { scholarshipService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PolicyPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', name: '' });
  const [sort, setSort] = useState('default');
  
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await scholarshipService.getAll({ is_active: true, category: 'policy' });
        const formatTime = (iso) => {
          if (!iso) return '';
          if (!iso.includes('T')) return iso;
          const [year, month, day] = iso.split('T')[0].split('-');
          return `${day}/${month}/${year}`;
        };
        const formattedData = (data || []).map(item => ({
          ...item, 
          time: formatTime(item.time),
          rawTime: item.time
        }));
        setPolicies(formattedData);
        
        const uniqueTypes = [...new Set(formattedData.map(s => s.type))].filter(Boolean);
        setTypes(uniqueTypes);
      } catch (error) {
        console.error('Error fetching policies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Dynamic programs list based on selected classification
  const availablePrograms = useMemo(() => {
    let list = policies;
    if (filter.type) {
      list = list.filter(p => p.type === filter.type);
    }
    return [...new Set(list.map(p => p.name))].sort();
  }, [policies, filter.type]);

  const filteredPolicies = policies
    .filter(p => {
      const matchType = filter.type === '' || p.type === filter.type;
      const matchName = filter.name === '' || p.name === filter.name;
      return matchType && matchName;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.rawTime) - new Date(a.rawTime);
      if (sort === 'oldest') return new Date(a.rawTime) - new Date(b.rawTime);
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Section */}
      <div className="bg-slate-900 pt-12 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="flex items-center gap-2 text-xs text-white/50 mb-8">
            <Link to="/" className="hover:text-white/80 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80">Chính sách miễn & giảm học phí</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary-light mb-3">
                <div className="w-8 h-px bg-primary-light/30" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Hỗ trợ sinh viên</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                Chính sách <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Miễn & Giảm học phí</span>
              </h1>
              <p className="text-white/60 font-medium max-w-2xl leading-relaxed">
                Tra cứu các quy định, đối tượng và điều kiện áp dụng chính sách miễn giảm học phí tại Trường Đại học Kinh tế - ĐHĐN.
              </p>
            </div>
            
            <div className="flex items-center gap-8 bg-white/[0.05] backdrop-blur-sm p-4 rounded-2xl border border-white/10">
               <div className="text-center">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Tổng cộng</p>
                  <p className="text-2xl font-black text-primary-light">{policies.length}</p>
               </div>
               <div className="w-px h-8 bg-white/10" />
               <div className="text-center">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Đang áp dụng</p>
                  <p className="text-2xl font-black text-white">{policies.filter(p => p.is_active).length}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 mr-2">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Bộ lọc:</span>
            </div>
            
            {/* Dropdown 1: Phân loại chính sách */}
            <select
              value={filter.type}
              onChange={e => setFilter({ name: '', type: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50"
            >
              <option value="">Tất cả phân loại chính sách</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Dropdown 2: Chương trình (Động) */}
            <select
              value={filter.name}
              onChange={e => setFilter({...filter, name: e.target.value})}
              className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 max-w-[300px]"
            >
              <option value="">Tất cả chương trình</option>
              {availablePrograms.map(name => <option key={name} value={name}>{name}</option>)}
            </select>

            <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block" />

            {/* Dropdown 3: Sắp xếp */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sắp xếp:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50"
              >
                <option value="default">Mặc định</option>
                <option value="newest">Mới nhất trước</option>
                <option value="oldest">Cũ nhất trước</option>
              </select>
            </div>

            { (filter.type !== '' || filter.name !== '' || sort !== 'default') && (
              <button 
                onClick={() => {
                  setFilter({type: '', name: ''});
                  setSort('default');
                }}
                className="text-xs font-bold text-primary hover:underline ml-2"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="mt-4 text-slate-400 font-medium">Đang tải danh sách chính sách...</p>
          </div>
        ) : filteredPolicies.length === 0 ? (
          <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-slate-500 max-w-md mx-auto">Vui lòng thử thay đổi bộ lọc hoặc quay lại sau để cập nhật thông tin mới nhất.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {filteredPolicies.map((p, idx) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group"
              >
                <div className="p-6 md:p-8 bg-white border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                      <FileText className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{p.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Calendar className="w-3.5 h-3.5" /> {p.time}
                        </span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider rounded-md">
                          {p.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                    Xem chi tiết nội dung bên dưới <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-900 overflow-hidden relative group/image">
                  {p.images && p.images.length > 0 ? (
                    p.images.map((img, i) => (
                      <img
                        key={img.id || i}
                        src={img.url?.startsWith('http') ? img.url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${img.url}`}
                        alt={`${p.name} - Trang ${i + 1}`}
                        className="w-full object-contain max-h-[1200px] transition-transform duration-700 hover:scale-[1.01]"
                        loading="lazy"
                      />
                    ))
                  ) : (
                    <img
                      src={p.image_url?.startsWith('http') ? p.image_url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${p.image_url}`}
                      alt={p.name}
                      className="w-full object-contain max-h-[1200px] transition-transform duration-700 group-hover/image:scale-[1.01]"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute top-6 right-6 opacity-0 group-hover/image:opacity-100 transition-opacity">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 shadow-xl flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-slate-800">Ảnh chứa nội dung chính sách</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Kết thúc thông tin chính sách</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
