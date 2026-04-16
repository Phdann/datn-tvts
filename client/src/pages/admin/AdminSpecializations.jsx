import { useState, useEffect } from 'react';
import { 
  Plus, Pencil, Trash2, Search, BookOpen, 
  Layers, Filter, RefreshCw, X, Save, 
  Info, ChevronRight, Building2, Tag,
  Loader2
} from 'lucide-react';
import api from '../../services/api';
import { majorService, facultyService, trainingTypeService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminSpecializations() {
  const [specs, setSpecs] = useState([]);
  const [majors, setMajors] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', major_id: '', description: '', admission_code: '' });
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState([]);
  const [admissionCodes, setAdmissionCodes] = useState({}); // { [typeId]: code }
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  
  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    major_id: '',
    faculty_id: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setSelectedIds([]);
      const params = {};
      if (filters.major_id) params.major_id = filters.major_id;
      if (filters.faculty_id) params.faculty_id = filters.faculty_id;
      
      const r = await api.get('/admin/specializations', { params });
      setSpecs(r.data?.data || (Array.isArray(r.data) ? r.data : []));
    } catch (err) {
      console.error(err);
      setSpecs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.major_id, filters.faculty_id]);

  useEffect(() => {
    // Load dropdown data
    majorService.getAllMajors({ limit: 500 }).then(d => setMajors(d.data || [])).catch(() => {});
    facultyService.getAllFaculties().then(res => setFaculties(Array.isArray(res) ? res : res.data || [])).catch(() => {});
    trainingTypeService.getAllTrainingTypes({ is_visible: true }).then(types => {
      setTrainingTypes(types);
      if (types.length > 0) setSelectedTypeIds([types[0].id.toString()]);
    }).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/specializations/${id}`);
      fetchData();
      toast.success('Xoá chuyên ngành thành công');
    } catch (err) {
      toast.error('Không thể xoá chuyên ngành này.');
    }
  };

  const openEdit = (s) => {
    setEditing(s?.id || 'new');
    const codes = s ? parseAdmissionCodes(s.admission_code) : {};
    setAdmissionCodes(codes);
    // Auto select type IDs that have codes
    const activeIds = Object.keys(codes).filter(id => id !== 'original');
    setSelectedTypeIds(activeIds.length > 0 ? activeIds : (trainingTypes.length > 0 ? [trainingTypes[0].id.toString()] : []));

    setForm(s ? { 
      name: s.name, 
      code: s.code || '', 
      major_id: s.major_id || '', 
      description: s.description || '',
      admission_code: s.admission_code || ''
    } : { 
      name: '', 
      code: '', 
      major_id: '', 
      description: '',
      admission_code: ''
    });
  };

  const getAbbr = (name) => {
    if (name.includes('Tiêu Chuẩn')) return 'TC';
    if (name.includes('Bán Phần')) return 'BPTA';
    if (name.includes('Toàn Phần')) return 'TPTA';
    return name.substring(0, 3).toUpperCase();
  };

  const parseAdmissionCodes = (str) => {
    try {
      if (!str) return {};
      const parsed = JSON.parse(str);
      return typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      if (str && str.trim()) return { "original": str };
      return {};
    }
  };

  const formatAdmissionCodesDisplay = (str) => {
    const codes = parseAdmissionCodes(str);
    const entries = Object.entries(codes);
    if (entries.length === 0) return '---';
    
    return entries.map(([id, code]) => {
      if (id === 'original') return code;
      const type = trainingTypes.find(t => t.id.toString() === id);
      return `${type ? getAbbr(type.name) : id}: ${code}`;
    }).reduce((acc, curr, i) => i === 0 ? curr : acc + ' ' + curr, '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const filteredCodes = {};
      selectedTypeIds.forEach(id => {
        if (admissionCodes[id]) filteredCodes[id] = admissionCodes[id];
      });
      const finalForm = { ...form, admission_code: JSON.stringify(filteredCodes) };
      if (editing === 'new') await api.post('/admin/specializations', finalForm);
      else await api.put(`/admin/specializations/${editing}`, finalForm);
      setEditing(null);
      fetchData();
      toast.success('Lưu dữ liệu chuyên ngành thành công');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi lưu dữ liệu chuyên ngành');
    } finally {
      setSaving(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSpecs.length) setSelectedIds([]);
    else setSelectedIds(filteredSpecs.map(s => s.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${selectedIds.length} chuyên ngành đã chọn?`)) return;
    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => api.delete(`/admin/specializations/${id}`)));
      toast.success(`Đã xoá ${selectedIds.length} chuyên ngành`);
      setSelectedIds([]);
      fetchData();
    } catch {
      toast.error('Lỗi khi xoá hàng loạt');
      setLoading(false);
    }
  };

  const filteredSpecs = specs.filter(s => 
    (s.name || '').toLowerCase().includes(filters.search.toLowerCase()) || 
    (s.code || '').toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 flex items-center justify-center rounded-2xl shadow-sm">
            <Layers className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">QUẢN LÝ CHUYÊN NGÀNH</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">PHÂN NHÁNH CHUYÊN SÂU THEO NGÀNH HỌC</p>
          </div>
        </div>
        <button 
          onClick={() => openEdit(null)} 
          className="bg-primary text-white text-xs font-black px-6 py-3 flex items-center gap-2 hover:bg-primary/90 transition-all rounded-xl uppercase tracking-widest shadow-sm"
        >
          <Plus className="w-4 h-4" /> THÊM CHUYÊN NGÀNH
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc mã chuyên ngành..." 
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-12 pr-4 py-3.5 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl transition-all bg-slate-50 focus:bg-white shadow-inner-sm" 
            />
          </div>
          <div className="w-full lg:w-64">
            <select 
              value={filters.faculty_id}
              onChange={(e) => setFilters({...filters, faculty_id: e.target.value, major_id: ''})}
              className="w-full border border-slate-200 px-4 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest outline-none focus:border-primary bg-slate-50 focus:bg-white rounded-xl appearance-none"
            >
              <option value="">TẤT CẢ KHOA</option>
              {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="w-full lg:w-64">
            <select 
              value={filters.major_id}
              onChange={(e) => setFilters({...filters, major_id: e.target.value})}
              className="w-full border border-slate-200 px-4 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest outline-none focus:border-primary bg-slate-50 focus:bg-white rounded-xl appearance-none"
            >
              <option value="">TẤT CẢ NGÀNH</option>
              {majors
                .filter(m => !filters.faculty_id || m.faculty_id == filters.faculty_id)
                .map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <button 
            type="button"
            onClick={() => { setFilters({search:'', major_id:'', faculty_id:''}); fetchData(); }}
            className="p-3.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Đã chọn: <span className="text-primary">{selectedIds.length}</span> chuyên ngành
            </p>
            <button 
              onClick={handleBulkDelete}
              className="bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xoá mục đã chọn
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-separate border-spacing-0">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <th className="px-6 py-5 border-b border-slate-100 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredSpecs.length && filteredSpecs.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-5 border-b border-slate-100 w-12 text-center">STT</th>
                <th className="px-4 py-5 border-b border-slate-100 min-w-[250px]">CHUYÊN NGÀNH & MÃ</th>
                <th className="px-4 py-5 border-b border-slate-100">THUỘC NGÀNH HỌC</th>
                <th className="px-4 py-5 border-b border-slate-100">KHOA</th>
                <th className="px-4 py-5 border-b border-slate-100 text-center w-28 whitespace-nowrap">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center"><LoadingSpinner /></td></tr>
              ) : filteredSpecs.map((s, idx) => (
                <tr key={s.id} className={`hover:bg-slate-50 transition-all group ${selectedIds.includes(s.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggleSelectRow(s.id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-slate-900 font-bold group-hover:text-primary transition-colors uppercase tracking-tight">{s.name}</div>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic border-slate-200 pr-2">MÃ: {s.code}</div>
                          <div className="text-[9px] font-bold text-primary uppercase tracking-widest pl-0">{formatAdmissionCodesDisplay(s.admission_code)}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <BookOpen className="w-3.5 h-3.5 text-slate-300" />
                      {s.Major?.name || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="inline-flex items-center px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">
                      <Building2 className="w-3 h-3 mr-1.5 opacity-40 text-primary" />
                      {s.Major?.Faculty?.name || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEdit(s)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setConfirmDelete({ open: true, id: s.id })}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredSpecs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                       <Layers className="w-16 h-16" />
                       <p className="font-black text-sm uppercase tracking-widest">Không có dữ liệu chuyên ngành</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit/Add */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 uppercase">
          <div className="bg-white w-full max-w-2xl shadow-2xl border border-slate-200 rounded-2xl h-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white text-slate-900 shrink-0">
              <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> {editing === 'new' ? 'THÊM CHUYÊN NGÀNH' : 'CHỈNH SỬA CHUYÊN NGÀNH'}
              </h2>
              <button onClick={() => setEditing(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">MÃ CHUYÊN NGÀNH *</label>
                  <input 
                    required 
                    value={form.code} 
                    onChange={e => setForm({...form, code: e.target.value})} 
                    placeholder="VD: 734040502" 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-inner-sm transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">TÊN CHUYÊN NGÀNH *</label>
                  <input 
                    required 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    placeholder="VD: Quản trị hệ thống thông tin" 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-inner-sm transition-all" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NGÀNH HỌC TRỰC THUỘC *</label>
                <select 
                  required 
                  value={form.major_id} 
                  onChange={e => setForm({...form, major_id: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-[13px] font-black text-slate-600 rounded-xl focus:outline-none focus:border-primary appearance-none shadow-inner-sm"
                >
                  <option value="">-- Chọn ngành học --</option>
                  {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div className="space-y-4 pt-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">LOẠI HÌNH ĐÀO TẠO & MÃ XÉT TUYỂN *</label>
                <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {trainingTypes.map((type) => {
                    const isSelected = selectedTypeIds.includes(type.id.toString());
                    return (
                      <div key={type.id} className={`flex items-center px-4 py-3 gap-4 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex items-center gap-3 flex-1">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const id = type.id.toString();
                              setSelectedTypeIds(prev => 
                                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                              );
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                            {type.name}
                          </span>
                        </div>
                        
                        {isSelected && (
                          <div className="w-48 animate-in slide-in-from-right-2 fade-in duration-200">
                            <input 
                              value={admissionCodes[type.id.toString()] || ''}
                              onChange={(e) => setAdmissionCodes({ ...admissionCodes, [type.id.toString()]: e.target.value })}
                              placeholder="Nhập MXT..."
                              className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-blue-600 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm transition-all placeholder:text-slate-300"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 mt-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">MÔ TẢ HƯỚNG CHUYÊN SÂU</label>
                <textarea 
                  rows={3} 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  placeholder="Mô tả tóm tắt về chuyên ngành đào tạo..." 
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-[13px] font-medium rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-inner-sm resize-none transition-all" 
                />
              </div>

              <div className="pt-5 flex gap-4 border-t border-slate-100 mt-2 shrink-0">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all">HUỶ BỎ</button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  LƯU CHUYÊN NGÀNH
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
        title="Xoá chuyên ngành"
        message="Bạn có chắc chắn muốn xoá chuyên ngành này?"
        type="danger"
      />
    </div>
  );
}
