import { useState, useEffect } from 'react';
import { 
  Search, Eye, Filter, Download, FileText, User, 
  Mail, Calendar, ChevronRight, Info, SearchCode,
  CheckCircle2, Clock, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { 
  applicationService, majorService, admissionMethodService 
} from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import ApplicationReviewModal from '../../components/admin/ApplicationReviewModal';

const statusBadge = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  Reviewing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
  SupplementNeeded: 'bg-orange-50 text-orange-700 border-orange-200',
};

const statusLabels = {
  Pending: 'Chờ xử lý',
  Processing: 'Đang xử lý',
  Reviewing: 'Đang đánh giá',
  Approved: 'Đã trúng tuyển',
  Rejected: 'Đã từ chối',
  SupplementNeeded: 'Cần bổ sung',
};

export default function AdminApplicationList() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    major_id: '',
    method_id: '',
    from_date: '',
    to_date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Review Modal State
  const [reviewingApp, setReviewingApp] = useState(null);
  
  // Dropdown data
  const [majors, setMajors] = useState([]);
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [mRes, methRes] = await Promise.all([
          majorService.getAllMajors({ limit: 100 }),
          admissionMethodService.getAllAdmissionMethods()
        ]);
        setMajors(mRes.data || []);
        const actualMethods = Array.isArray(methRes) ? methRes : (methRes.data || []);
        setMethods(actualMethods);
      } catch (err) { console.error(err); }
    };
    loadFiltersData();
  }, []);

  const fetch = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, ...filters };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      
      const res = await applicationService.getAllApplications(params);
      setApps(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch { setApps([]); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page, filters.status, filters.major_id, filters.method_id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetch();
  };

  const handleUpdateApplication = async (id, data) => {
    await applicationService.updateApplicationStatus(id, data);
    fetch();
  };

  const openReview = async (app) => {
    try {
      const fullDetail = await applicationService.getApplicationById(app.id);
      setReviewingApp(fullDetail);
    } catch (err) {
      setReviewingApp(app);
    }
  };

  const exportData = async () => {
    try {
      const blob = await applicationService.exportApplications(filters);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { console.error(err); }
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', major_id: '', method_id: '', from_date: '', to_date: '' });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
            Quản lý & Đánh giá hồ sơ
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> Hệ thống hiện có {totalItems} hồ sơ đăng ký xét tuyển
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all uppercase tracking-tighter"
          >
            <Download className="w-3.5 h-3.5" /> Xuất dữ liệu
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black shadow-sm transition-all uppercase tracking-tighter ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'} border`}
          >
            <Filter className="w-3.5 h-3.5" /> Bộ lọc chuyên sâu {Object.values(filters).filter(v => v !== '').length > 0 && `(${Object.values(filters).filter(v => v !== '').length})`}
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cần xử lý</div>
          <div className="text-2xl font-black text-amber-500">
            {apps.filter(a => a.status === 'Pending').length} <span className="text-[10px] text-slate-300 font-bold lowercase tracking-normal italic ml-1">(trên trang này)</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đang đánh giá</div>
          <div className="text-2xl font-black text-indigo-500">
            {apps.filter(a => a.status === 'Reviewing').length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã trúng tuyển</div>
          <div className="text-2xl font-black text-emerald-500">
            {apps.filter(a => a.status === 'Approved').length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tỉ lệ duyệt</div>
          <div className="text-2xl font-black text-slate-900">
            {totalItems > 0 ? Math.round((apps.filter(a => a.status === 'Approved').length / apps.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Main Filter Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Tìm theo tên thí sinh, email, SĐT hoặc mã hồ sơ..." 
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all rounded-2xl" 
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <button type="submit" className="bg-primary text-white px-8 py-3 text-sm font-black hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 rounded-2xl uppercase tracking-widest">
            Tìm hồ sơ
          </button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 animate-slideDown">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Trạng thái hiện tại</label>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 p-3 text-xs font-bold focus:outline-none focus:border-primary rounded-xl appearance-none"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(statusLabels).map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Ngành xét tuyển</label>
              <select 
                value={filters.major_id} 
                onChange={(e) => setFilters({...filters, major_id: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 p-3 text-xs font-bold focus:outline-none focus:border-primary rounded-xl appearance-none"
              >
                <option value="">Tất cả ngành học</option>
                {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Phương thức xét tuyển</label>
              <select 
                value={filters.method_id} 
                onChange={(e) => setFilters({...filters, method_id: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 p-3 text-xs font-bold focus:outline-none focus:border-primary rounded-xl appearance-none"
              >
                <option value="">Tất cả phương thức</option>
                {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Khoảng ngày nộp</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={filters.from_date}
                    onChange={(e) => setFilters({...filters, from_date: e.target.value})}
                    className="flex-1 bg-slate-50 border border-slate-100 p-2 text-[10px] font-bold rounded-lg focus:outline-none"
                  />
                  <span className="text-slate-300">-</span>
                  <input 
                    type="date" 
                    value={filters.to_date}
                    onChange={(e) => setFilters({...filters, to_date: e.target.value})}
                    className="flex-1 bg-slate-50 border border-slate-100 p-2 text-[10px] font-bold rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <button onClick={clearFilters} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List Content */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <th className="text-left px-6 py-5 border-b border-slate-100">Hồ sơ & Thí sinh</th>
                <th className="text-left px-6 py-5 border-b border-slate-100">Nguyện vọng</th>
                <th className="text-center px-6 py-5 border-b border-slate-100">Điểm xét</th>
                <th className="text-left px-6 py-5 border-b border-slate-100">Trạng thái</th>
                <th className="text-right px-6 py-5 border-b border-slate-100">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : apps.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm leading-tight flex items-center gap-2">
                          {a.Candidate?.name}
                          <span className="text-[10px] font-bold text-slate-300">#{a.id}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-300" /> {a.Candidate?.email}
                        </div>
                        <div className="text-[10px] text-slate-400 italic mt-0.5">Nộp lúc: {new Date(a.createdAt).toLocaleString('vi-VN')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-black text-slate-700">{a.Major?.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter truncate max-w-[180px]">
                      {a.AdmissionMethod?.name}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-block px-3 py-1 bg-primary/5 text-primary rounded-xl font-black text-base tracking-tighter shadow-sm border border-primary/10">
                      {a.Candidate?.high_school_score}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border shadow-sm ${statusBadge[a.status] || ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${
                        a.status === 'Pending' ? 'bg-amber-400' : 
                        a.status === 'Reviewing' ? 'bg-indigo-400' : 
                        a.status === 'Approved' ? 'bg-emerald-400' : 'bg-red-400'
                      }`} />
                      {statusLabels[a.status]}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => openReview(a)}
                      className="px-4 py-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-slate-900/10 hover:bg-black hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center gap-2 ml-auto"
                    >
                      <SearchCode className="w-4 h-4" /> Đánh giá
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && apps.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-12 h-12 opacity-10" />
                      <p className="font-bold text-sm uppercase tracking-widest">Không có hồ sơ nào phù hợp</p>
                      <button onClick={clearFilters} className="text-xs font-black text-primary underline">Xoá lọc</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Evaluation Interface Component */}
      {reviewingApp && (
        <ApplicationReviewModal 
          application={reviewingApp} 
          onClose={() => setReviewingApp(null)}
          onUpdate={handleUpdateApplication}
        />
      )}
    </div>
  );
}
