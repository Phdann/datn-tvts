import { useState, useEffect } from 'react';
import { 
  Plus, Pencil, Trash2, Search, GraduationCap, 
  BookOpen, RefreshCw, Building2, DollarSign, 
  Target, X, Save, Info, Filter, ArrowUpDown
} from 'lucide-react';
import { majorService, facultyService, trainingTypeService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminMajorList() {
  const [majors, setMajors] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    code: '', name: '', faculty_id: '', tuition: '', 
    quota: '', description: '', training_type_ids: []
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  
  const [summaryStats, setSummaryStats] = useState({
    total_quota: 0,
    total_applications: 0,
    total_approved: 0,
    fill_rate: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    faculty_id: ''
  });

  const fetchMajors = async () => {
    try {
      setLoading(true);
      setSelectedIds([]); // Clear selection on fetch
      const params = { 
        page, 
        limit: 10, 
        search: filters.search || undefined,
        faculty_id: filters.faculty_id || undefined
      };
      const d = await majorService.getAdminMajors(params);
      setMajors(d.data || []);
      setTotalPages(d.totalPages || 1);
      setTotalItems(d.total || 0);
    } catch (err) {
      console.error(err);
      setMajors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryStats = async () => {
    try {
      const stats = await majorService.getMajorSummaryStats();
      setSummaryStats(stats);
    } catch (err) {
      console.error('Failed to fetch summary stats:', err);
    }
  };

  useEffect(() => {
    fetchMajors();
  }, [page, filters.faculty_id]);

  useEffect(() => {
    fetchSummaryStats();
    facultyService.getAllFaculties().then(res => {
      setFaculties(Array.isArray(res) ? res : res.data || []);
    }).catch(console.error);
    trainingTypeService.getAllTrainingTypes().then(res => {
      setTrainingTypes(Array.isArray(res) ? res : res.data || []);
    }).catch(console.error);
  }, []);

  const handleTrainingTypeChange = (id) => {
    setForm(prev => {
      const currentIds = prev.training_type_ids || [];
      if (currentIds.includes(id)) {
        return { ...prev, training_type_ids: currentIds.filter(i => i !== id) };
      } else {
        return { ...prev, training_type_ids: [...currentIds, id] };
      }
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMajors();
  };

  const handleDelete = async (id) => {
    try {
      await majorService.deleteAdminMajor(id);
      fetchMajors();
      fetchSummaryStats();
      toast.success('Xoá ngành học thành công');
    } catch (err) {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === majors.length) setSelectedIds([]);
    else setSelectedIds(majors.map(m => m.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${selectedIds.length} ngành học đã chọn?`)) return;
    try {
      await Promise.all(selectedIds.map(id => majorService.deleteAdminMajor(id)));
      toast.success(`Đã xoá ${selectedIds.length} ngành học`);
      setSelectedIds([]);
      fetchMajors();
      fetchSummaryStats();
    } catch (err) {
      toast.error('Lỗi khi xoá hàng loạt');
    }
  };

  const openEdit = (m) => {
    setEditing(m?.id || 'new');
    setForm(m ? {
      code: m.code || '',
      name: m.name || '',
      faculty_id: m.faculty_id || '',
      tuition: m.tuition || '',
      quota: m.quota || '',
      description: m.description || '',
      training_type_ids: m.TrainingTypes?.map(t => t.id) || []
    } : {
      code: '',
      name: '',
      faculty_id: '',
      tuition: '',
      quota: '',
      description: '',
      training_type_ids: []
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing === 'new') await majorService.createMajor(form);
      else await majorService.updateMajor(editing, form);
      
      setEditing(null);
      fetchMajors();
      fetchSummaryStats();
      toast.success(editing === 'new' ? 'Thêm ngành mới thành công' : 'Cập nhật ngành học thành công');
    } catch (err) {
      toast.error('Lỗi khi lưu dữ liệu ngành học');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
            <GraduationCap className="w-8 h-8 text-primary" /> QUẢN LÝ NGÀNH ĐÀO TẠO
          </h1>
          <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> HỆ THỐNG ĐANG VẬN HÀNH {totalItems} NGÀNH HỌC THUỘC {faculties.length} KHOA
          </p>
        </div>
        <button 
          onClick={() => openEdit(null)} 
          className="bg-primary text-white text-[10px] font-black px-6 py-3.5 flex items-center gap-2 hover:bg-primary/90 transition-all rounded-xl uppercase tracking-widest shadow-sm"
        >
          <Plus className="w-4 h-4" /> Thêm ngành mới
        </button>
      </div>


      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Tìm theo tên ngành hoặc mã ngành..." 
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all rounded-xl shadow-inner-sm" 
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <div className="w-full lg:w-64">
            <select 
              value={filters.faculty_id}
              onChange={(e) => {
                setFilters({...filters, faculty_id: e.target.value});
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 text-xs font-bold focus:outline-none focus:border-primary rounded-xl appearance-none shadow-none"
            >
              <option value="">Tất cả khoa</option>
              {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-primary text-white px-8 py-3.5 text-[11px] font-black hover:bg-primary-dark transition-all rounded-xl uppercase tracking-widest">
            Tìm kiếm
          </button>
          <button 
            type="button"
            onClick={() => { setFilters({search:'', faculty_id:''}); setPage(1); fetchMajors(); }}
            className="p-3.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </form>

        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Đã chọn: <span className="text-primary">{selectedIds.length}</span> ngành học
            </p>
            <button 
              onClick={handleBulkDelete}
              className="bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xoá mục đã chọn
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0 text-center">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <th className="px-6 py-5 border-b border-slate-100 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === majors.length && majors.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-5 border-b border-slate-100 w-12">STT</th>
                <th className="text-left px-6 py-5 border-b border-slate-100">Ngành & Mã ngành</th>
                <th className="text-left px-6 py-5 border-b border-slate-100">Khoa trực thuộc</th>
                <th className="text-right px-6 py-5 border-b border-slate-100">Chỉ tiêu</th>
                <th className="text-right px-6 py-5 border-b border-slate-100">Học phí</th>
                <th className="text-center px-6 py-5 border-b border-slate-100 border-r-0">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center"><LoadingSpinner /></td>
                </tr>
              ) : majors.map((m, index) => (
                <tr key={m.id} className={`hover:bg-slate-50/80 transition-all group ${selectedIds.includes(m.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-6 py-5">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(m.id)}
                      onChange={() => toggleSelectRow(m.id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-5 font-bold text-slate-400 text-[11px]">
                     {(page - 1) * 10 + index + 1}
                  </td>
                  <td className="px-6 py-5 text-left">
                    <div>
                      <div className="font-black text-slate-900 text-sm leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">{m.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MÃ: {m.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-slate-300" />
                      {m.Faculty?.name || 'Chưa phân khoa'}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 rounded-full font-black text-xs text-slate-700 border border-slate-100">
                      <Target className="w-3 h-3 text-emerald-500" /> {m.quota || 0}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <div className="text-xs font-black text-slate-700 flex items-center justify-end gap-1">
                      <DollarSign className="w-3 h-3 text-slate-300" />
                      {m.tuition ? `${Number(m.tuition).toLocaleString()}đ` : 'Miễn phí'}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openEdit(m)} 
                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setConfirmDelete({ open: true, id: m.id })}
                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && majors.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <BookOpen className="w-16 h-16" />
                      <p className="font-black text-sm uppercase tracking-widest">Không tìm thấy ngành học nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-6 bg-slate-50/50 border-t border-slate-100">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Modal Edit/Add */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-slate-100 h-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between text-slate-900 bg-white shrink-0">
              <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> {editing === 'new' ? 'THÊM NGÀNH MỚI' : 'CHỈNH SỬA NGÀNH HỌC'}
              </h2>
              <button onClick={() => setEditing(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 flex-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Tên ngành học *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: Công nghệ thông tin" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-inner-sm transition-all" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Mã ngành *</label>
                  <input required value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="VD: 7310101" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-inner-sm transition-all" />
                </div>
              </div>
              
              <div className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-12 md:col-span-6 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Khoa trực thuộc *</label>
                  <select required value={form.faculty_id} onChange={e => setForm({...form, faculty_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold rounded-xl focus:outline-none focus:border-primary appearance-none shadow-inner-sm">
                    <option value="">Chọn khoa</option>
                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="col-span-12 md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Chỉ tiêu</label>
                  <input type="number" value={form.quota} onChange={e => setForm({...form, quota: e.target.value})} placeholder="120" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-inner-sm transition-all" />
                </div>
                <div className="col-span-12 md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Học phí (năm)</label>
                  <input type="number" value={form.tuition} onChange={e => setForm({...form, tuition: e.target.value})} placeholder="18000000" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-inner-sm transition-all" />
                </div>
              </div>



              <div className="space-y-1.5 mt-4">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Giới thiệu ngành học</label>
                <textarea rows={5} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Mô tả về ngành nghề đào tạo..." className="w-full bg-slate-50 border border-slate-200 p-4 text-sm font-medium rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-inner-sm resize-none transition-all" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Hệ đào tạo (Chọn tối đa 5 hệ) *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {trainingTypes.map(t => (
                    <label 
                      key={t.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        form.training_type_ids?.includes(t.id) 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" 
                        checked={form.training_type_ids?.includes(t.id)}
                        onChange={() => handleTrainingTypeChange(t.id)} 
                      />
                      <span className="text-xs font-bold">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-4 shrink-0 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-white border border-slate-200 text-slate-500 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all">Hủy</button>
                <button type="submit" disabled={saving} className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu dữ liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Xoá ngành học"
        message="Bạn có chắc chắn muốn xoá ngành này? Tất cả dữ liệu liên quan sẽ bị ảnh hưởng."
        type="danger"
      />
    </div>
  );
}
