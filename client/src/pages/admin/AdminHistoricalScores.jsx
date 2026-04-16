import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Search, TrendingUp, Eye, EyeOff, RefreshCw, BarChart3, Upload, Globe, Image as ImageIcon } from 'lucide-react';
import { admissionMethodService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_URL}${url}`;
};

/* ─── Inline row editor ─── */
function BenchmarkRow({ method, index, isSelected, onSelect, onSave, onConfirmDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    name: method.name || '',
    image_urls: method.image_urls || (method.image_url ? [method.image_url] : []), 
    year: method.year || new Date().getFullYear(),
    is_public: method.is_public ?? true
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const save = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      data.append('type', 'benchmark');
      
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && k !== 'image_urls' && k !== 'image_url') data.append(k, v);
      });
      
      if (form.image_urls) {
        data.append('kept_images', JSON.stringify(form.image_urls));
      }
      imageFiles.forEach(file => data.append('images', file));
      
      await onSave(method.id, data);
      setEditing(false);
      setImageFiles([]);
      toast.success('Cập nhật điểm chuẩn thành công');
    } catch (e) {
      toast.error('Lỗi khi lưu điểm chuẩn');
    }
    setSaving(false);
  };

  if (editing) {
    return (
      <tr className="bg-blue-50/50">
        <td className="px-6 py-2"></td>
        <td className="px-4 py-2 text-center text-slate-400 font-bold text-xs">{index + 1}</td>
        <td className="px-4 py-2">
          <input 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
            aria-label="Tên thông báo" 
            className="w-full border border-primary px-3 py-2 text-sm bg-white focus:outline-none rounded-xl font-bold shadow-inner-sm" 
          />
        </td>
        <td className="px-4 py-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
             <button 
               type="button"
               onClick={() => document.getElementById(`edit-benchmark-image-${method.id}`).click()}
               className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-dashed border-slate-100 text-slate-500 hover:border-primary/50 hover:text-primary transition-all rounded-2xl group"
             >
               <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
               <span className="text-[11px] font-black uppercase tracking-widest">TỆP TIN</span>
             </button>

             <div className="relative group/input">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
                 <Globe className="w-4 h-4" />
               </div>
               <input 
                 value={imageUrlInput}
                 onChange={e => setImageUrlInput(e.target.value)}
                 onKeyDown={e => {
                   if (e.key === 'Enter') {
                     e.preventDefault();
                     if (imageUrlInput.trim()) {
                       setForm(f => ({ ...f, image_urls: [...f.image_urls, imageUrlInput.trim()] }));
                       setImageUrlInput('');
                     }
                   }
                 }}
                 placeholder="Dán link ảnh & Enter..."
                 className="w-full bg-slate-50/50 border border-slate-100 pl-11 pr-12 py-3 text-[11px] font-bold focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all shadow-inner-sm"
               />
               <button 
                 type="button"
                 onClick={() => {
                   if (imageUrlInput.trim()) {
                     setForm(f => ({ ...f, image_urls: [...f.image_urls, imageUrlInput.trim()] }));
                     setImageUrlInput('');
                   }
                 }}
                 className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:scale-110 transition-all shadow-md shadow-blue-200"
               >
                 <Plus className="w-4 h-4" />
               </button>
             </div>

             <div className="flex gap-2 flex-wrap pt-1">
               {form.image_urls.map((url, i) => (
                 <div key={`kept-${i}`} className="relative group/img animate-in zoom-in-50">
                   <img src={getImageUrl(url)} alt="Preview" className="h-14 w-14 object-cover rounded-2xl border border-slate-100 bg-white shadow-sm" />
                   <button type="button" onClick={() => setForm(f => ({...f, image_urls: f.image_urls.filter((_, idx) => idx !== i)}))} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover/img:opacity-100 transition-all scale-75 hover:scale-110"><X className="w-2.5 h-2.5"/></button>
                 </div>
               ))}
               {imageFiles.map((file, i) => (
                 <div key={`new-${i}`} className="relative group/img animate-in zoom-in-50">
                   <img src={URL.createObjectURL(file)} alt="Preview" className="h-14 w-14 object-cover rounded-2xl border border-blue-100 bg-white shadow-sm" />
                   <button type="button" onClick={() => setImageFiles(f => f.filter((_, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover/img:opacity-100 transition-all scale-75 hover:scale-110"><X className="w-2.5 h-2.5"/></button>
                 </div>
               ))}
               {!form.image_urls.length && !imageFiles.length && (
                 <div className="w-full py-4 border-2 border-dashed border-slate-50 rounded-2xl flex items-center justify-center opacity-10">
                    <ImageIcon className="w-6 h-6" />
                 </div>
               )}
             </div>
          </div>
          <input
            id={`edit-benchmark-image-${method.id}`}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={e => {
              const files = Array.from(e.target.files);
              setImageFiles(prev => [...prev, ...files]);
            }}
          />
        </td>
        <td className="px-4 py-2">
          <input type="number" aria-label="Năm" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
            className="w-full border border-primary px-2 py-1.5 text-sm focus:outline-none rounded-xl" />
        </td>
        <td className="px-4 py-2">
          <select 
            value={form.is_public ? 'true' : 'false'}
            onChange={e => setForm({ ...form, is_public: e.target.value === 'true' })}
            className="w-full border border-primary px-2 py-1.5 text-sm focus:outline-none bg-white rounded-xl"
          >
            <option value="true">Công khai</option>
            <option value="false">Ẩn</option>
          </select>
        </td>
        <td className="px-4 py-2 text-center space-x-1 min-w-[120px]">
          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={save} 
              disabled={saving} 
              className="bg-blue-600 text-white text-[10px] font-black px-5 py-2.5 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 rounded-full transition-all uppercase tracking-widest shadow-md shadow-blue-100"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? '...' : 'LƯU'}
            </button>
            <button 
              onClick={() => setEditing(false)} 
              className="bg-slate-100 text-slate-500 p-2.5 hover:bg-slate-200 rounded-full transition-all shadow-sm"
              title="Hủy"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  const allImages = method.image_urls || (method.image_url ? [method.image_url] : []);
  return (
    <tr className={`border-t border-slate-100 hover:bg-slate-50 group transition-all ${isSelected ? 'bg-primary/5' : ''}`}>
      <td className="px-6 py-4">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onSelect(method.id)}
          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
        />
      </td>
      <td className="px-4 py-4 text-center font-bold text-slate-400 text-[11px]">{index + 1}</td>
      <td className="px-4 py-3 font-bold text-slate-800 text-sm">{method.name}</td>
      <td className="px-4 py-3">
        {allImages.length > 0 ? (
          <div className="flex gap-1 flex-wrap max-w-[200px]">
            {allImages.map((url, i) => (
              <img key={i} src={getImageUrl(url)} alt="Ảnh" className="h-10 w-auto object-contain rounded shadow-sm border border-slate-100 bg-white" />
            ))}
          </div>
        ) : (
          <span className="text-slate-300 italic text-sm">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm font-black text-slate-800 text-center">{method.year || '—'}</td>
      <td className="px-4 py-3">
        {method.is_public ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Eye className="w-3 h-3" /> Công khai
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            <EyeOff className="w-3 h-3" /> Đã ẩn
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-center min-w-[100px]">
        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onConfirmDelete(method.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Add form ─── */
function AddForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', image_urls: [], year: new Date().getFullYear(), is_public: true, type: 'benchmark' });
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('year', form.year);
      data.append('is_public', form.is_public);
      data.append('type', 'benchmark');
      
      if (form.image_urls.length > 0) {
        data.append('image_urls', JSON.stringify(form.image_urls));
      }
      imageFiles.forEach(file => data.append('images', file));
      
      await onSave(data);
      toast.success('Thêm điểm chuẩn thành công');
    } catch (e) {
      toast.error('Lỗi khi thêm điểm chuẩn');
    }
    setSaving(false);
  };

  return (
    <tr className="bg-emerald-50/60 border-t-2 border-emerald-300">
      <td className="px-6 py-2"></td>
      <td className="px-4 py-2 text-center text-emerald-600 font-bold text-xs">+</td>
      <td className="px-4 py-2">
        <input
          autoFocus
          value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Tiêu đề thông báo điểm chuẩn *"
          className="w-full border border-emerald-300 px-3 py-2 text-sm focus:outline-none bg-white rounded-xl shadow-inner-sm"
        />
      </td>
      <td className="px-4 py-2">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
           <button 
             type="button"
             onClick={() => document.getElementById('add-score-image').click()}
             className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-dashed border-slate-100 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all rounded-2xl group"
           >
             <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
             <span className="text-[11px] font-black uppercase tracking-widest">TỆP TIN</span>
           </button>

           <div className="relative group/input">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
               <Globe className="w-4 h-4" />
             </div>
             <input 
               value={imageUrlInput}
               onChange={e => setImageUrlInput(e.target.value)}
               onKeyDown={e => {
                 if (e.key === 'Enter') {
                   e.preventDefault();
                   if (imageUrlInput.trim()) {
                     setForm(f => ({ ...f, image_urls: [...f.image_urls, imageUrlInput.trim()] }));
                     setImageUrlInput('');
                   }
                 }
               }}
               placeholder="Dán link ảnh & Enter..."
               className="w-full bg-slate-50/50 border border-slate-100 pl-11 pr-12 py-3 text-[11px] font-bold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl transition-all shadow-inner-sm"
             />
             <button 
               type="button"
               onClick={() => {
                 if (imageUrlInput.trim()) {
                   setForm(f => ({ ...f, image_urls: [...f.image_urls, imageUrlInput.trim()] }));
                   setImageUrlInput('');
                 }
               }}
               className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 hover:scale-110 transition-all shadow-md shadow-emerald-200"
             >
               <Plus className="w-4 h-4" />
             </button>
           </div>

           <div className="flex gap-2 flex-wrap pt-1">
             {form.image_urls.map((url, i) => (
               <div key={`kept-${i}`} className="relative group/img animate-in zoom-in-50">
                 <img src={getImageUrl(url)} alt="Preview" className="h-14 w-14 object-cover rounded-2xl border border-slate-100 bg-white shadow-sm" />
                 <button type="button" onClick={() => setForm(f => ({...f, image_urls: f.image_urls.filter((_, idx) => idx !== i)}))} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover/img:opacity-100 transition-all scale-75 hover:scale-110"><X className="w-2.5 h-2.5"/></button>
               </div>
             ))}
             {imageFiles.map((file, i) => (
               <div key={`new-${i}`} className="relative group/img animate-in zoom-in-50">
                 <img src={URL.createObjectURL(file)} alt="Preview" className="h-14 w-14 object-cover rounded-2xl border border-emerald-100 bg-white shadow-sm" />
                 <button type="button" onClick={() => setImageFiles(f => f.filter((_, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover/img:opacity-100 transition-all scale-75 hover:scale-110"><X className="w-2.5 h-2.5"/></button>
               </div>
             ))}
             {!form.image_urls.length && !imageFiles.length && (
               <div className="w-full py-4 border-2 border-dashed border-emerald-100/30 rounded-2xl flex items-center justify-center opacity-10">
                  <ImageIcon className="w-6 h-6" />
               </div>
             )}
           </div>
        </div>
        <input
          id="add-score-image"
          type="file" accept="image/*" multiple hidden
          onChange={e => {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);
          }}
        />
      </td>
      <td className="px-4 py-2 text-center">
        <input
          type="number"
          value={form.year}
          onChange={e => setForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
          className="w-20 border border-emerald-300 px-3 py-2 text-sm focus:outline-none bg-white rounded-xl shadow-inner-sm text-center font-bold"
        />
      </td>
      <td className="px-4 py-2">
        <select 
          value={form.is_public ? 'true' : 'false'}
          onChange={e => setForm({ ...form, is_public: e.target.value === 'true' })}
          className="w-full border border-emerald-300 px-3 py-2 text-sm focus:outline-none bg-white rounded-xl shadow-inner-sm font-bold"
        >
          <option value="true">Công khai</option>
          <option value="false">Ẩn</option>
        </select>
      </td>
      <td className="px-4 py-2 text-center space-x-1 min-w-[100px]">
        <div className="flex items-center justify-center gap-1">
          <button onClick={save} disabled={saving || !form.name.trim()} className="bg-emerald-600 text-white text-xs px-4 py-2 hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-1 rounded-xl transition-all font-black uppercase tracking-widest shadow-sm">
            <Save className="w-3.5 h-3.5" />{saving ? '...' : 'Thêm'}
          </button>
          <button onClick={onCancel} className="bg-white border border-slate-200 text-slate-500 text-xs px-3 py-2 hover:bg-slate-50 inline-flex items-center gap-1 rounded-xl transition-all font-black">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Main page ─── */
export default function AdminHistoricalScores() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      setSelectedIds([]);
      const d = await admissionMethodService.getAllAdmissionMethods({ limit: 100, type: 'benchmark' });
      setMethods(d?.data || (Array.isArray(d) ? d : []));
    } catch (e) { 
      console.error('Error loading benchmark:', e);
      setMethods([]); 
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (formData) => {
    try {
      await admissionMethodService.createAdmissionMethod(formData);
      setAdding(false);
      load();
    } catch (e) { 
      toast.error(e.response?.data?.message || 'Lỗi tạo điểm chuẩn');
    }
  };

  const handleUpdate = async (id, formData) => {
    try { 
      await admissionMethodService.updateAdmissionMethod(id, formData);
      load(); 
    } catch (e) { 
      toast.error(e.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async (id) => {
    try { 
      await admissionMethodService.deleteAdmissionMethod(id); 
      load(); 
      toast.success('Xoá thành công');
    } catch (e) { 
      toast.error(e.response?.data?.message || 'Lỗi khi xoá');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(m => m.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${selectedIds.length} mục đã chọn?`)) return;
    try {
      await Promise.all(selectedIds.map(id => admissionMethodService.deleteAdmissionMethod(id)));
      toast.success(`Đã xoá ${selectedIds.length} mục`);
      setSelectedIds([]);
      load();
    } catch {
      toast.error('Lỗi khi xoá hàng loạt');
    }
  };

  const filtered = methods.filter(m =>
    (m.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
         
          <div>
            <h1 className="text-2xl font-black text-blue-950 tracking-tight uppercase flex items-center gap-3">
               <div className="p-2 bg-blue-50 rounded-xl"><BarChart3 className="w-6 h-6 text-blue-600" /></div>
               Điểm chuẩn lịch sử
            </h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Quản lý dữ liệu điểm trúng tuyển qua các năm</p>
          </div>
        </div>
        <button
          onClick={() => { setAdding(true); }}
          className="bg-primary text-white text-xs font-black px-6 py-3 flex items-center gap-2 hover:bg-primary/90 rounded-xl transition-all uppercase tracking-widest shadow-sm"
        >
          <Plus className="w-4 h-4" /> Thêm mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text" placeholder="Tìm kiếm theo tiêu đề..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl transition-all bg-slate-50 focus:bg-white shadow-inner-sm"
            />
          </div>
          <button 
            type="button"
            onClick={load}
            className="p-3.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Đã chọn: <span className="text-primary">{selectedIds.length}</span> mục
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
                  <th className="px-4 py-5 border-b border-slate-100">Tiêu đề bài đăng</th>
                  <th className="px-4 py-5 border-b border-slate-100 whitespace-nowrap">Ảnh bảng điểm</th>
                  <th className="px-4 py-5 border-b border-slate-100 w-24 text-center whitespace-nowrap">Năm TS</th>
                  <th className="px-4 py-5 border-b border-slate-100 w-32 whitespace-nowrap">Trạng thái</th>
                  <th className="px-4 py-5 border-b border-slate-100 text-center w-28 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adding && (
                  <AddForm onSave={handleCreate} onCancel={() => setAdding(false)} />
                )}
                {filtered.map((m, idx) => (
                  <BenchmarkRow 
                    key={m.id} 
                    method={m} 
                    index={idx}
                    isSelected={selectedIds.includes(m.id)}
                    onSelect={toggleSelectRow}
                    onSave={handleUpdate} 
                    onConfirmDelete={(id) => setConfirmDelete({ open: true, id })} 
                  />
                ))}
                {filtered.length === 0 && !adding && (
                  <tr>
                    <td colSpan={7} className="px-4 py-32 text-center">
                       <div className="flex flex-col items-center gap-3 opacity-20">
                          <TrendingUp className="w-16 h-16" />
                          <p className="font-black text-sm uppercase tracking-widest">{search ? 'Không tìm thấy kết quả nào phù hợp' : 'Chưa có thông báo điểm chuẩn nào'}</p>
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
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Xoá thông báo điểm chuẩn"
        message="Bạn có chắc chắn muốn xoá bản ghi này?"
        type="danger"
      />
    </div>
  );
}
