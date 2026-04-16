import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save, ArrowLeft, GraduationCap, TrendingUp, Plus, Pencil, Trash2,
  X, ChevronDown, Award, BookOpen,
} from 'lucide-react';
import { majorService, facultyService, historicalScoreService, admissionMethodService, trainingTypeService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const inputCls = 'w-full border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary';

/* ─── Tab: Thông tin ngành ─── */
function TabInfo({ form, setForm, faculties, trainingTypes, isNew, saving, onSubmit }) {
  const toggleTrainingType = (id) => {
    const current = form.training_type_ids || [];
    if (current.includes(id)) {
      setForm({ ...form, training_type_ids: current.filter(i => i !== id) });
    } else {
      if (current.length < 3) {
        setForm({ ...form, training_type_ids: [...current, id] });
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border border-slate-200 p-6 space-y-4 rounded-xl shadow-sm">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Mã ngành *</label>
          <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className={inputCls} placeholder="VD: 7310101" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tên ngành *</label>
          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="VD: Kinh tế" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Khoa *</label>
        <div className="relative">
          <select required value={form.faculty_id} onChange={e => setForm({ ...form, faculty_id: e.target.value })} className={`${inputCls} appearance-none pr-8`}>
            <option value="">Chọn khoa</option>
            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Học phí (VNĐ/năm)</label>
          <input type="number" value={form.tuition} onChange={e => setForm({ ...form, tuition: e.target.value })} className={inputCls} placeholder="VD: 18000000" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Chỉ tiêu</label>
          <input type="number" value={form.quota} onChange={e => setForm({ ...form, quota: e.target.value })} className={inputCls} placeholder="VD: 120" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2">Loại hình đào tạo (Chọn 1-3) *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {trainingTypes.map(t => (
            <label key={t.id} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
              (form.training_type_ids || []).includes(t.id) 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={(form.training_type_ids || []).includes(t.id)}
                onChange={() => toggleTrainingType(t.id)}
              />
              <span className="text-xs font-bold leading-none">{t.name}</span>
            </label>
          ))}
        </div>
        {(form.training_type_ids || []).length === 0 && (
          <p className="text-[10px] text-red-500 mt-1">* Vui lòng chọn ít nhất 1 loại hình đào tạo</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Mô tả ngành</label>
        <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} placeholder="Giới thiệu ngành đào tạo..." />
      </div>
      <button type="submit" disabled={saving} className="bg-primary text-white text-sm font-semibold px-6 py-2.5 flex items-center gap-2 hover:bg-primary-light disabled:opacity-50 rounded-xl transition-all">
        <Save className="w-4 h-4" />{saving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>
  );
}

/* ─── Tab: Điểm chuẩn (scoped to this major) ─── */
function TabScores({ majorId }) {
  const [scores, setScores] = useState([]);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addForm, setAddForm] = useState({ method_id: '', year: new Date().getFullYear(), score: '' });
  const [error, setError] = useState('');
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const load = async () => {
    try {
      setLoading(true);
      const [sd, md] = await Promise.all([
        historicalScoreService.getAllHistoricalScores({ major_id: majorId, limit: 100 }),
        admissionMethodService.getAllAdmissionMethods({ limit: 100 }),
      ]);
      setScores(sd.data || (Array.isArray(sd) ? sd : []));
      setMethods(md.data || (Array.isArray(md) ? md : []));
    } catch { setScores([]); }
    setLoading(false);
  };

  useEffect(() => { if (majorId) load(); }, [majorId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!addForm.method_id || !addForm.year || !addForm.score) return;
    setError('');
    try {
      await historicalScoreService.createHistoricalScore({ ...addForm, major_id: majorId });
      setAdding(false);
      setAddForm({ method_id: '', year: new Date().getFullYear(), score: '' });
      toast.success('Thêm điểm chuẩn thành công');
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi tạo điểm chuẩn'); }
  };

  const handleUpdate = async (id) => {
    try { 
      await historicalScoreService.updateHistoricalScore(id, editForm); 
      setEditId(null); 
      load(); 
      toast.success('Cập nhật điểm chuẩn thành công');
    }
    catch (err) { toast.error(err.response?.data?.message || 'Lỗi cập nhật'); }
  };

  const handleDelete = async (id) => {
    try { 
      await historicalScoreService.deleteHistoricalScore(id); 
      load(); 
      toast.success('Xoá điểm chuẩn thành công');
    }
    catch (err) { toast.error(err.response?.data?.message || 'Lỗi xoá'); }
  };

  const scoreColor = (s) => s >= 25 ? 'text-red-600 font-black' : s >= 22 ? 'text-amber-600 font-bold' : s >= 18 ? 'text-emerald-600 font-semibold' : 'text-slate-700';

  if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-4 flex items-center justify-between">
          <span>{error}</span><button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500"><strong>{scores.length}</strong> bản ghi điểm chuẩn của ngành này</p>
        {!adding && (
          <button onClick={() => setAdding(true)} className="bg-primary text-white text-xs px-3 py-1.5 flex items-center gap-1 hover:bg-primary-light rounded-xl transition-all">
            <Plus className="w-3 h-3" /> Thêm điểm chuẩn
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 overflow-x-auto rounded-none shadow-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Phương thức xét tuyển</th>
              <th className="text-center px-4 py-3">Năm</th>
              <th className="text-center px-4 py-3">Điểm chuẩn</th>
              <th className="text-center px-4 py-3 w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* Add row */}
            {adding && (
              <tr className="bg-emerald-50/60 border-t-2 border-emerald-300">
                <td className="px-4 py-2">
                  <div className="relative">
                    <select autoFocus value={addForm.method_id} onChange={e => setAddForm({ ...addForm, method_id: e.target.value })}
                      className="w-full border border-slate-200 px-2 py-1.5 text-sm focus:outline-none appearance-none pr-7">
                      <option value="">Chọn phương thức *</option>
                      {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={addForm.year} onChange={e => setAddForm({ ...addForm, year: e.target.value })}
                    min="2000" max="2030" className="w-20 border border-slate-200 px-2 py-1.5 text-sm text-center focus:outline-none" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={addForm.score} onChange={e => setAddForm({ ...addForm, score: e.target.value })}
                    min="0" max="30" step="0.01" className="w-20 border border-slate-200 px-2 py-1.5 text-sm text-center focus:outline-none" placeholder="0–30" />
                </td>
                <td className="px-4 py-2 text-center space-x-1">
                  <button onClick={handleCreate} className="bg-primary text-white text-xs px-2 py-1 hover:bg-primary/90 rounded-xl transition-all"><Save className="w-3 h-3" /></button>
                  <button onClick={() => setAdding(false)} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-xl transition-all"><X className="w-3 h-3" /></button>
                </td>
              </tr>
            )}

            {scores.map(s => editId === s.id ? (
              <tr key={s.id} className="bg-blue-50/60 border-t border-slate-100">
                <td className="px-4 py-2">
                  <div className="relative">
                    <select value={editForm.method_id} onChange={e => setEditForm({ ...editForm, method_id: e.target.value })}
                      className="w-full border border-primary px-2 py-1.5 text-sm focus:outline-none appearance-none pr-7">
                      {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={editForm.year} onChange={e => setEditForm({ ...editForm, year: e.target.value })}
                    min="2000" max="2030" className="w-20 border border-slate-200 px-2 py-1.5 text-sm text-center focus:outline-none" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={editForm.score} onChange={e => setEditForm({ ...editForm, score: e.target.value })}
                    min="0" max="30" step="0.01" className="w-20 border border-slate-200 px-2 py-1.5 text-sm text-center focus:outline-none" />
                </td>
                  <button onClick={() => handleUpdate(s.id)} className="bg-primary text-white text-xs px-2 py-1 hover:bg-primary/90 rounded-xl transition-all"><Save className="w-3 h-3" /></button>
                  <button onClick={() => setEditId(null)} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-xl transition-all"><X className="w-3 h-3" /></button>
              </tr>
            ) : (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50 group">
                <td className="px-4 py-3 text-slate-600">{s.AdmissionMethod?.name || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5">{s.year}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-base ${scoreColor(s.score)}`}>{s.score}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => { setEditId(s.id); setEditForm({ method_id: s.method_id, year: s.year, score: s.score }); }}
                    className="text-blue-500 hover:bg-blue-50 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity inline-block">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setConfirmDelete({ open: true, id: s.id })} className="text-red-400 hover:bg-red-50 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity inline-block">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {scores.length === 0 && !adding && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400 text-sm">
                Chưa có điểm chuẩn nào cho ngành này
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 p-4 border border-slate-100 bg-slate-50 text-xs text-slate-500">
        Để quản lý <strong>Phương thức xét tuyển</strong>, truy cập{' '}
        <Link to="/admin/admission-methods" className="text-primary font-semibold hover:underline">
          Quản lý phương thức tuyển sinh →
        </Link>
      </div>

      <ConfirmModal 
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Xoá điểm chuẩn"
        message="Bạn có chắc chắn muốn xoá bản ghi điểm chuẩn này?"
        type="danger"
      />
    </div>
  );
}

/* ─── Main page ─── */
export default function AdminMajorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({ code: '', name: '', faculty_id: '', tuition: '', quota: '', description: '', training_type_ids: [] });
  const [faculties, setFaculties] = useState([]);
  const [trainingTypes, setTrainingTypes] = useState([]);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [savedName, setSavedName] = useState('');
  const toast = useToast();

  useEffect(() => {
    facultyService.getAllFaculties().then(d => setFaculties(Array.isArray(d) ? d : d.data || [])).catch(() => {});
    trainingTypeService.getAllTrainingTypes({ is_visible: true }).then(d => setTrainingTypes(d)).catch(() => {});
    if (!isNew) {
      majorService.getAdminMajorById(id)
        .then(d => {
          setForm({ 
            code: d.code || '', 
            name: d.name || '', 
            faculty_id: d.faculty_id || '', 
            tuition: d.tuition || '', 
            quota: d.quota || '', 
            description: d.description || '',
            training_type_ids: d.TrainingTypes?.map(t => t.id) || []
          });
          setSavedName(d.name || '');
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isNew) await majorService.createMajor(form);
      else await majorService.updateMajor(id, form);
      navigate('/admin/majors');
    } catch (err) { 
      toast.error('Lỗi khi lưu dữ liệu ngành học');
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  const tabs = [
    { id: 'info', label: 'Thông tin ngành', icon: BookOpen },
    ...(!isNew ? [{ id: 'scores', label: 'Điểm chuẩn lịch sử', icon: TrendingUp }] : []),
  ];

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate('/admin/majors')} className="flex items-center gap-1.5 text-xs text-primary font-semibold mb-5 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách ngành
      </button>

      {/* Page heading */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-primary/10 flex items-center justify-center rounded-xl">
          <GraduationCap className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900">
            {isNew ? 'Thêm ngành mới' : `Chỉnh sửa: ${savedName || form.name}`}
          </h1>
          {!isNew && (
            <p className="text-xs text-slate-400">ID: {id} · Mã: <span className="font-semibold text-primary">{form.code}</span></p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-0">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'info' && (
        <TabInfo 
          form={form} 
          setForm={setForm} 
          faculties={faculties} 
          trainingTypes={trainingTypes}
          isNew={isNew} 
          saving={saving} 
          onSubmit={handleSubmit} 
        />
      )}

      {tab === 'scores' && !isNew && (
        <TabScores majorId={id} />
      )}
    </div>
  );
}
