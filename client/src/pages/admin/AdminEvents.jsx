import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Calendar, Search, RefreshCw, X, Save, MapPin, Loader2, Info, Globe, Image as ImageIcon, Upload } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', location: '', event_date: '', end_date: '', status: 'upcoming', image: '', registration_link: '' });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageSource, setImageSource] = useState('file'); // 'file' | 'url'
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [search, setSearch] = useState('');

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  const fetch = async () => { 
    try { 
      setLoading(true); 
      setSelectedIds([]);
      const r = await api.get('/admin/events'); 
      setEvents(r.data?.data || (Array.isArray(r.data) ? r.data : [])); 
    } catch { 
      setEvents([]); 
    } 
    setLoading(false); 
  };
  
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/events/${id}`);
      fetch();
      toast.success('Xoá sự kiện thành công');
    } catch (err) {
      toast.error('Lỗi khi xoá sự kiện');
    }
  };

  const openEdit = (ev) => { 
    setEditing(ev?.id || 'new'); 
    setForm(ev ? { 
      title: ev.title, 
      description: ev.description || '', 
      location: ev.location || '', 
      event_date: ev.event_date?.slice(0, 10) || '', 
      end_date: ev.end_date?.slice(0, 10) || '', 
      status: ev.status, 
      image: ev.image || '', 
      registration_link: ev.registration_link || '' 
    } : { 
      title: '', 
      description: '', 
      location: '', 
      event_date: '', 
      end_date: '', 
      status: 'upcoming', 
      image: '', 
      registration_link: '' 
    }); 
    setImageFile(null);
    setImageSource(ev?.image?.startsWith('http') ? 'url' : 'file');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'image') formData.append(k, v);
      });
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        formData.append('image', form.image || '');
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing === 'new') await api.post('/admin/events', formData, config);
      else await api.put(`/admin/events/${editing}`, formData, config);
      setEditing(null);
      fetch();
      toast.success('Lưu sự kiện thành công');
    } catch (err) {
      toast.error('Lỗi khi lưu sự kiện');
    } finally {
      setSaving(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(e => e.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${selectedIds.length} sự kiện đã chọn?`)) return;
    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => api.delete(`/admin/events/${id}`)));
      toast.success(`Đã xoá ${selectedIds.length} sự kiện`);
      setSelectedIds([]);
      fetch();
    } catch {
      toast.error('Lỗi khi xoá hàng loạt');
      setLoading(false);
    }
  };

  const filtered = (events || []).filter(e =>
    (e.title || '').toLowerCase().includes(filters.search.toLowerCase()) &&
    (filters.status === '' || e.status === filters.status) &&
    (filters.startDate === '' || e.event_date >= filters.startDate) &&
    (filters.endDate === '' || e.event_date <= filters.endDate)
  );

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-slate-50 focus:bg-white';

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-50 border border-pink-100 flex items-center justify-center rounded-2xl shadow-sm">
            <Calendar className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Quản lý Sự kiện</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Lịch trình & Hoạt động tuyển sinh</p>
          </div>
        </div>
        <button 
          onClick={() => openEdit(null)} 
          className="bg-primary text-white text-xs font-black px-6 py-3 flex items-center gap-2 hover:bg-primary/90 rounded-xl transition-all uppercase tracking-widest shadow-sm"
        >
          <Plus className="w-4 h-4" /> Thêm sự kiện mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[24px] p-2.5 shadow-sm mb-6 flex flex-col lg:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện, địa điểm..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-slate-50 border border-transparent pl-11 pr-4 py-3 text-sm font-medium focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-[18px] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-transparent hover:border-slate-200 px-3.5 py-2 rounded-[16px] transition-all">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="bg-transparent border-none text-[11px] font-black text-slate-600 uppercase tracking-widest focus:ring-0 cursor-pointer h-7"
            >
              <option value="">Trạng thái</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã kết thúc</option>
              <option value="cancelled">Đã huỷ</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-transparent hover:border-slate-200 px-3.5 py-2 rounded-[16px] transition-all">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex items-center gap-1.5 h-7">
              <input
                type="date"
                className="bg-transparent text-[11px] font-black uppercase tracking-tighter outline-none text-slate-600 w-24"
                value={filters.startDate}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
              />
              <span className="text-slate-300">-</span>
              <input
                type="date"
                className="bg-transparent text-[11px] font-black uppercase tracking-tighter outline-none text-slate-600 w-24"
                value={filters.endDate}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="button"
            onClick={fetch}
            className="p-3 bg-slate-50 text-slate-400 rounded-[16px] hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Đã chọn: <span className="text-primary">{selectedIds.length}</span> sự kiện
            </p>
            <button 
              onClick={handleBulkDelete}
              className="bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xoá mục đã chọn
            </button>
          </div>
        )}


      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-2xl shadow-2xl border border-slate-200 rounded-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase tracking-widest">
                {editing === 'new' ? 'Thêm sự kiện mới' : 'Chỉnh sửa sự kiện'}
              </h2>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Tên sự kiện *</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ví dụ: Ngày hội tư vấn tuyển sinh 2024" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Mô tả chi tiết</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Thông tin tóm tắt về sự kiện..." className={`${inputCls} resize-none`} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Ngày bắt đầu</label>
                    <input type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} className={`${inputCls} font-bold`} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Ngày kết thúc</label>
                    <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className={`${inputCls} font-bold`} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Địa điểm tổ chức</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Ví dụ: Sân tờ A, Cơ sở chính" className={`${inputCls} pl-10`} />
                  </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Trạng thái sự kiện</label>
                   <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={`${inputCls} font-bold`}>
                     <option value="upcoming">Sắp diễn ra</option>
                     <option value="ongoing">Đang diễn ra</option>
                     <option value="completed">Đã kết thúc</option>
                     <option value="cancelled">Đã huỷ</option>
                   </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Hình ảnh sự kiện</label>
                  
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex bg-slate-50 border-b border-slate-100 p-1">
                      <button 
                        type="button"
                        onClick={() => setImageSource('file')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${imageSource === 'file' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Upload className="w-3 h-3" /> Tệp tin
                      </button>
                      <button 
                        type="button"
                        onClick={() => setImageSource('url')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${imageSource === 'url' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Globe className="w-3 h-3" /> Đường dẫn
                      </button>
                    </div>

                    <div className="p-5 space-y-4">
                      <div 
                        className="relative aspect-video rounded-xl border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group/preview"
                        onClick={() => imageSource === 'file' && document.getElementById('event-image').click()}
                      >
                        {(imageFile || form.image) ? (
                          <img 
                            src={imageFile ? URL.createObjectURL(imageFile) : (form.image?.startsWith('http') ? form.image : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${form.image}`)} 
                            alt="Preview" 
                            className="w-full h-full object-cover animate-in zoom-in-50 duration-300" 
                          />
                        ) : (
                          <div className="flex flex-col items-center text-slate-300">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Xem trước ảnh</span>
                          </div>
                        )}
                        <input 
                          id="event-image"
                          type="file" 
                          accept="image/*" 
                          onChange={e => setImageFile(e.target.files[0])} 
                          className="hidden"
                        />
                      </div>

                      {imageSource === 'url' && (
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input 
                            value={form.image?.startsWith('http') ? form.image : ''}
                            onChange={e => {
                              setImageFile(null);
                              setForm({...form, image: e.target.value});
                            }}
                            placeholder="Dán link ảnh tại đây..."
                            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-primary rounded-xl transition-all shadow-inner-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-100 bg-slate-50 px-8 py-5 -mx-8 -mb-8">
                <button type="button" onClick={() => setEditing(null)} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                  Huỷ bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="bg-primary text-white text-[11px] font-black uppercase tracking-widest px-10 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all font-black uppercase tracking-widest"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu sự kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/50">
                <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  <th className="px-6 py-5 border-b border-slate-100 w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-5 border-b border-slate-100 w-12 text-center">STT</th>
                  <th className="px-4 py-5 border-b border-slate-100 min-w-[300px]">Tên sự kiện</th>
                  <th className="px-4 py-5 border-b border-slate-100">Thời gian</th>
                  <th className="px-4 py-5 border-b border-slate-100">Địa điểm</th>
                  <th className="px-4 py-5 border-b border-slate-100 text-center">Trạng thái</th>
                  <th className="px-4 py-5 border-b border-slate-100 text-right w-28 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e, idx) => (
                  <tr key={e.id} className={`hover:bg-slate-50 transition-all group ${selectedIds.includes(e.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(e.id)}
                        onChange={() => toggleSelectRow(e.id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</td>
                    <td className="px-4 py-4">
                       <span className="font-bold text-slate-700 block truncate group-hover:text-primary transition-colors">{e.title}</span>
                       <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mt-0.5 italic">Ref: EVT-{e.id}</span>
                    </td>
                    <td className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                      {e.event_date ? new Date(e.event_date).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        {e.location || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                       {e.status === 'upcoming' && <span className="text-blue-500 text-[9px] font-black uppercase px-2.5 py-1 bg-blue-50 rounded-full border border-blue-100 tracking-widest">Sắp diễn ra</span>}
                       {e.status === 'ongoing' && <span className="text-emerald-500 text-[9px] font-black uppercase px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100 tracking-widest animate-pulse">Đang diễn ra</span>}
                       {e.status === 'completed' && <span className="text-slate-400 text-[9px] font-black uppercase px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100 tracking-widest">Đã kết thúc</span>}
                       {e.status === 'cancelled' && <span className="text-red-500 text-[9px] font-black uppercase px-2.5 py-1 bg-red-50 rounded-full border border-red-100 tracking-widest">Đã huỷ</span>}
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openEdit(e)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Sửa sự kiện">
                           <Pencil className="w-4 h-4" />
                         </button>
                         <button onClick={() => setConfirmDelete({ open: true, id: e.id })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Xoá sự kiện">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-32 text-center">
                       <div className="flex flex-col items-center gap-3 opacity-20">
                          <Calendar className="w-16 h-16" />
                          <p className="font-black text-sm uppercase tracking-widest">Chưa có sự kiện nào</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmModal 
        isOpen={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Xoá sự kiện" message="Bạn có chắc muốn xoá sự kiện này?"
        type="danger"
      />
    </div>
  );
}
