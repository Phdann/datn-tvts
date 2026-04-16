import { useState, useEffect } from 'react';
import { majorService } from '../../services';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save, ArrowLeft, Brain, Zap, AlertCircle, CheckCircle, FileText,
  BookOpen, Tag, Calendar, GraduationCap, Link as LinkIcon, Info, Upload, X, File
} from 'lucide-react';
import api from '../../services/api';
import { parseFile } from '../../utils/fileParser';

const CONTENT_TYPES = [
  { value: 'general',     label: 'Thông tin chung',   icon: '📋' },
  { value: 'admission',   label: 'Tuyển sinh',        icon: '🎓' },
  { value: 'major',       label: 'Ngành học',         icon: '📚' },
  { value: 'scholarship', label: 'Học bổng',          icon: '💰' },
  { value: 'tuition',     label: 'Học phí',           icon: '💵' },
  { value: 'campus',      label: 'Cơ sở vật chất',    icon: '🏫' },
  { value: 'policy',      label: 'Chính sách',        icon: '📜' },
  { value: 'faq',         label: 'FAQ',               icon: '❓' },
];

export default function AdminChatData() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState({
    title: '',
    content: '',
    content_type: 'general',
    admission_year: new Date().getFullYear(),
    major: '',
    keywords: '',
    source: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [msg, setMsg] = useState(null);
  
  const [importedFiles, setImportedFiles] = useState([]);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [majors, setMajors] = useState([]);

  useEffect(() => {
    majorService.getAllMajors({ limit: 200 })
      .then(d => setMajors(d.data || d || []))
      .catch(() => setMajors([]));

    if (!isNew) {
      api.get('/admin/chat-data')
        .then(r => {
          const items = Array.isArray(r.data) ? r.data : r.data?.data || [];
          const item = items.find(i => String(i.id) === String(id));
          if (item) {
            setForm({
              title: item.title || '',
              content: item.content || '',
              content_type: item.content_type || 'general',
              admission_year: item.admission_year || new Date().getFullYear(),
              major: item.major || '',
              keywords: item.keywords || '',
              source: item.source || '',
              status: item.status || 'active',
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleFileImport = async (files) => {
    if (!files || files.length === 0) return;
    
    setImporting(true);
    setMsg(null);
    
    const results = [];
    for (const file of files) {
      try {
        const parsed = await parseFile(file);
        results.push({
          name: file.name,
          size: file.size,
          content: parsed.content,
          source: parsed.source
        });
      } catch (err) {
        setMsg({ type: 'error', text: `❌ ${file.name}: ${err.message}` });
        setImporting(false);
        return;
      }
    }
    
    if (results.length > 0) {
      let newContent = form.content;
      results.forEach(result => {
        if (newContent && !newContent.endsWith('\n')) newContent += '\n\n';
        newContent += `=== ${result.source} ===\n${result.content}`;
      });
      
      updateField('content', newContent);
      setImportedFiles([...importedFiles, ...results]);
      setMsg({ type: 'success', text: `✅ Imported ${results.length} file(s)` });
    }
    
    setImporting(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileImport(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setMsg({ type: 'error', text: 'Vui lòng nhập tiêu đề và nội dung!' });
      return;
    }

    try {
      setSaving(true);
      setMsg(null);

      if (isNew) {
       
        const r = await api.post('/admin/chat-data/ingest', form);
        let text = '✅ Đã nạp kiến thức thành công! AI đã học dữ liệu mới.';
        if (r.data?.chunksAdded !== undefined) {
          text += ` (${r.data.chunksAdded} đoạn)`;
        }
        setMsg({ type: 'success', text });
      } else {
       
        const r = await api.put(`/admin/chat-data/${id}`, form);
        let text = '✅ Đã cập nhật và đồng bộ lại với AI!';
        if (r.data?.chunksAdded !== undefined) {
          text += ` (${r.data.chunksAdded} đoạn mới)`;
        }
        setMsg({ type: 'success', text });
      }

      setTimeout(() => navigate('/admin/chat-data'), 1500);
    } catch (err) {
      if (err.response?.status === 409) {
        const dupId = err.response.data.duplicate_id;
        setMsg({ 
          type: 'error', 
          text: (
            <div className="flex flex-col gap-1">
              <span>{err.response.data.message}</span>
              {dupId && (
                <button 
                  type="button"
                  onClick={() => {
                    setMsg(null);
                    navigate(`/admin/chat-data/edit/${dupId}`);
                  }}
                  className="text-xs font-bold underline hover:no-underline text-left mt-1"
                >
                  Xem bản ghi trùng lặp (ID: {dupId})
                </button>
              )}
            </div>
          )
        });
      } else {
        setMsg({ type: 'error', text: 'Lỗi: ' + (err.response?.data?.message || err.message) });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2563eb] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const inputCls = 'w-full border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] transition-colors placeholder:text-slate-400';

  return (
    <div className="w-full">
      
      <button
        onClick={() => navigate('/admin/chat-data')}
        className="flex items-center gap-1.5 text-xs text-[#2563eb] font-bold mb-5 hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#0077b6] flex items-center justify-center rounded-xl">
          {isNew ? <Zap className="w-5 h-5 text-white" /> : <Brain className="w-5 h-5 text-white" />}
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">
            {isNew ? 'Nạp kiến thức mới cho AI' : 'Chỉnh sửa & đồng bộ lại'}
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {isNew
              ? 'Dữ liệu sẽ được lưu vào cơ sở dữ liệu và vector hóa cho AI.'
              : 'Cập nhật sẽ tự động xóa vector cũ và nạp lại kiến thức mới.'
            }
          </p>
        </div>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 px-4 py-3 mb-6 border rounded-xl ${
          msg.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
        }`}>
          {msg.type === 'success'
            ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          }
          <p className={`text-sm font-medium ${msg.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>{msg.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          
          <div className="lg:col-span-3 space-y-6">
           
            <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
              <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-5">
                <BookOpen className="w-4 h-4" /> Nội dung chính
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    autoFocus
                    placeholder="VD: Thông tin ngành Quản trị Kinh doanh năm 2026"
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className={`${inputCls} rounded-xl`}
                  />
                </div>

              
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer ${
                    dragActive
                      ? 'border-[#2563eb] bg-[#2563eb]/5'
                      : 'border-slate-300 bg-slate-50 hover:border-[#2563eb]/30'
                  }`}
                >
                  <input
                    type="file"
                    id="file-import"
                    multiple
                    accept=".txt,.csv,.json,.pdf,.docx,.doc,.xlsx,.xls"
                    onChange={(e) => handleFileImport(e.target.files)}
                    disabled={importing}
                    className="sr-only"
                  />
                  
                  <label htmlFor="file-import" className="flex flex-col items-center justify-center cursor-pointer">
                    <div className="w-12 h-12 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 text-center">
                      {importing ? 'Đang xử lý tệp...' : 'Nhấp hoặc kéo thả tệp vào đây'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5 text-center">
                      Hỗ trợ: TXT, CSV, JSON, PDF, DOCX, XLSX (Tối đa 20MB)
                    </p>
                  </label>
                </div>

              
                {importedFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600">
                      Tệp đã nhập ({importedFiles.length})
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {importedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                          <File className="w-4 h-4 text-[#2563eb] mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{file.source}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = importedFiles.filter((_, i) => i !== idx);
                              setImportedFiles(updated);
                            
                              const sourceMarker = `=== ${file.source} ===`;
                              const newContent = form.content
                                .split('\n')
                                .filter(line => !line.includes(sourceMarker))
                                .join('\n')
                                .trim();
                              updateField('content', newContent);
                            }}
                            className="text-slate-400 hover:text-red-500 shrink-0 p-1 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between items-end">
                    <span>Nội dung huấn luyện <span className="text-red-500">*</span></span>
                    <span className="text-[10px] font-normal text-slate-400 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Tự động phân tách (chunk) khi nạp
                    </span>
                  </label>
                  <textarea
                    required
                    rows={18}
                    placeholder={`Nhập hoặc tải tệp lên để AI học nội dung...\n\nVD:\nNgành Quản trị Kinh doanh (Mã: 7340101) thuộc Khoa Quản trị Kinh doanh.\n- Học phí: 16.500.000 đ/năm\n- Chỉ tiêu 2026: 200 sinh viên\n- Điểm chuẩn 2024: 22.5 điểm...`}
                    value={form.content}
                    onChange={(e) => updateField('content', e.target.value)}
                    className={`${inputCls} rounded-xl resize-y font-mono text-[13px] leading-relaxed bg-slate-50/50 focus:bg-white`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
          
            <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
              <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-5">
                <Tag className="w-4 h-4" /> Phân loại & Thuộc tính
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Loại nội dung</span>
                  </label>
                  <select
                    value={form.content_type}
                    onChange={(e) => updateField('content_type', e.target.value)}
                    className={`${inputCls} rounded-xl font-medium text-slate-700`}
                  >
                    {CONTENT_TYPES.map(({ value, label, icon }) => (
                      <option key={value} value={value}>{icon} {label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Năm tuyển sinh</span>
                  </label>
                  <input
                    type="number"
                    min="2020"
                    max="2030"
                    value={form.admission_year}
                    onChange={(e) => updateField('admission_year', parseInt(e.target.value) || '')}
                    className={`${inputCls} rounded-xl`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Ngành liên quan</span>
                  </label>
                  <select
                    value={form.major}
                    onChange={(e) => updateField('major', e.target.value)}
                    className={`${inputCls} rounded-xl`}
                  >
                    <option value="">-- Dành cho mọi ngành --</option>
                    {majors.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Nguồn tham khảo</span>
                  </label>
                  <input
                    placeholder="VD: Đề án tuyển sinh 2026"
                    value={form.source}
                    onChange={(e) => updateField('source', e.target.value)}
                    className={`${inputCls} rounded-xl`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Từ khóa (cách bằng dấu phẩy)</span>
                  </label>
                  <input
                    placeholder="VD: tuyển sinh, học phí, ..."
                    value={form.keywords}
                    onChange={(e) => updateField('keywords', e.target.value)}
                    className={`${inputCls} rounded-lg`}
                  />
                  {form.keywords && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {form.keywords.split(',').filter(Boolean).map((kw, i) => (
                        <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                          {kw.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
              <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Trạng thái xuất bản
              </h2>
              <div className="flex flex-col gap-2.5">
                {[
                  { value: 'active',   label: 'Kích hoạt',  desc: 'AI sẽ lập tức học dữ liệu này', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                  { value: 'draft',    label: 'Bản nháp',   desc: 'Lưu tạm, chưa nạp vào AI',      color: 'border-amber-400 bg-amber-50 text-amber-800' },
                  { value: 'archived', label: 'Lưu trữ',    desc: 'Dữ liệu cũ, ngưng sử dụng',     color: 'border-slate-300 bg-slate-50 text-slate-700' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('status', opt.value)}
                    className={`p-3.5 border-2 rounded-xl text-left transition-all flex items-center justify-between ${
                      form.status === opt.value
                        ? opt.color + ' border-current shadow-sm'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">{opt.label}</p>
                      <p className="text-[11px] mt-0.5 opacity-80 font-medium">{opt.desc}</p>
                    </div>
                    {form.status === opt.value && <CheckCircle className="w-5 h-5 opacity-50" />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 pb-10 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/admin/chat-data')}
            className="border border-slate-300 text-slate-700 text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-none"
          >
            Huỷ bỏ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#2563eb] text-white text-sm font-black px-8 py-2.5 rounded-xl shadow-none flex items-center gap-2 hover:bg-[#2563eb]/90 transition-all disabled:opacity-50 uppercase tracking-widest"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                {isNew ? 'Đang nạp...' : 'Đang cập nhật...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isNew ? 'Nạp kiến thức AI' : 'Cập nhật & Đồng bộ AI'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
