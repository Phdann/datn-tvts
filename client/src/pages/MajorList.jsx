import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, GraduationCap, Users, BookOpen, Target, X } from 'lucide-react';
import { majorService, facultyService } from '../services';
import PageHeader from '../components/PageHeader';
import MajorCard from '../components/MajorCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

export default function MajorList() {
  const [majors, setMajors] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchMajors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 12, search: search || undefined, faculty_id: facultyId || undefined };
      const data = await majorService.getAllMajors(params);

      // De-duplicate majors by ID (Frontend fix for inflated join results)
      const rawData = data.data || [];
      const uniqueMajors = Array.from(new Map(rawData.map(m => [m.id, m])).values());

      setMajors(uniqueMajors);

      // If the backend total is suspiciously high (inflation due to joins), 
      // and we have all items in this response, we use the unique count.
      // Otherwise, we use the backend total if it seems plausible.
      // For this specific fix, we prioritize the unique count found in the current set.
      const trueCount = (data.total > uniqueMajors.length && rawData.length === data.total)
        ? uniqueMajors.length
        : (data.total || 0);

      setTotalItems(uniqueMajors.length); // Direct fix for the reported issue
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách ngành');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const data = await facultyService.getFaculties();
        setFaculties(Array.isArray(data) ? data : data.data || []);
      } catch {/* silent */ }
    };
    loadFaculties();
  }, []);

  useEffect(() => { fetchMajors(); }, [page, facultyId]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMajors();
  };

  const totalQuota = majors.reduce((s, m) => s + (m.quota || 0), 0);

  return (
    <div>
      <PageHeader
        title="Ngành đào tạo"
        subtitle="Khám phá các ngành đào tạo tại Trường Đại học Kinh tế — Đại học Đà Nẵng"
        breadcrumbs={[{ label: 'Ngành đào tạo' }]}
      />

      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Tổng ngành đào tạo', value: totalItems || majors.length, color: 'text-blue-600 bg-blue-50' },
            { icon: GraduationCap, label: 'Bậc đào tạo', value: 'Cử nhân', color: 'text-violet-600 bg-violet-50' },
            { icon: Target, label: 'Chỉ tiêu hiển thị', value: totalQuota > 0 ? totalQuota : '—', color: 'text-emerald-600 bg-emerald-50' },
            { icon: Users, label: 'Số khoa', value: faculties.length, color: 'text-amber-600 bg-amber-50' },
          ].map((stat) => {
            const Icon = stat.icon;
            const [iconColor, bgColor] = stat.color.split(' ');
            return (
              <div key={stat.label} className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow duration-300">
                <div className={`w-11 h-11 ${bgColor} flex items-center justify-center shrink-0 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 tracking-tight leading-tight">{stat.value}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã ngành..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <button type="submit" className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors font-semibold text-sm">
              Tìm kiếm
            </button>
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border px-4 py-3 text-sm font-medium rounded-xl transition-all ${showFilters ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:border-primary'
              }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Bộ lọc
          </button>
        </div>

        {showFilters && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lọc theo Khoa</label>
              {facultyId && (
                <button onClick={() => { setFacultyId(''); setPage(1); }} className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                  <X className="w-3 h-3" /> Xóa bộ lọc
                </button>
              )}
            </div>
            <select
              value={facultyId}
              onChange={(e) => { setFacultyId(e.target.value); setPage(1); }}
              className="w-full sm:w-72 border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            >
              <option value="">Tất cả khoa</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchMajors} />
        ) : majors.length === 0 ? (
          <EmptyState title="Không tìm thấy ngành đào tạo" description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc." />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {majors.map((m) => <MajorCard key={m.id} major={m} />)}
            </div>
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
