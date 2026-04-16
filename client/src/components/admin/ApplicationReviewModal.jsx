import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, GraduationCap, FileText, 
  ExternalLink, CheckCircle2, XCircle, RefreshCw, 
  Search, Info, AlertCircle, Save, MessageSquare, Download
} from 'lucide-react';
import { generateApplicationPDF } from '../../utils/pdfGenerator';

const statusOptions = [
  { value: 'Pending', label: 'Chờ xử lý', color: 'text-amber-600 bg-amber-50' },
  { value: 'Reviewing', label: 'Đang đánh giá', color: 'text-blue-600 bg-blue-50' },
  { value: 'SupplementNeeded', label: 'Cần bổ sung hồ sơ', color: 'text-orange-600 bg-orange-50' },
  { value: 'Approved', label: 'Duyệt trúng tuyển', color: 'text-emerald-600 bg-emerald-50' },
  { value: 'Rejected', label: 'Từ chối hồ sơ', color: 'text-red-600 bg-red-50' },
];

export default function ApplicationReviewModal({ application, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    status: application.status || 'Pending',
    note: application.note || '',
    adminNotes: application.adminNotes || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setFormData({
        status: application.status,
        note: application.note || '',
        adminNotes: application.adminNotes || ''
      });
    }
  }, [application]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate(application.id, formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!application) return null;

  const candidate = application.Candidate || {};
  const major = application.Major || {};
  const method = application.AdmissionMethod || {};
  const docs = application.ApplicationDocuments || [];

  const getDocUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    // Normalize path for web (replace backslashes with forward slashes)
    const normalizedPath = path.replace(/\\/g, '/');
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${baseUrl}/${normalizedPath}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">Đánh giá hồ sơ xét tuyển</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mã hồ sơ: #{application.id} • Ngày nộp: {new Date(application.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => generateApplicationPDF(application)}
              className="px-4 py-2 text-[11px] font-black text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Xuất PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Left Side: Applicant & Evidence */}
          <div className="flex-1 p-6 space-y-8 min-w-0">
            {/* Candidate Box */}
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Thông tin thí sinh
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-5 border border-slate-100 italic">
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-0.5">Họ và tên</div>
                    <div className="text-sm font-black text-slate-900 leading-none">{candidate.name || 'N/A'}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-0.5">Email liên hệ</div>
                      <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5 underline decoration-primary/20">{candidate.email}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-0.5">Số điện thoại</div>
                    <div className="text-sm font-black text-slate-900">{candidate.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-0.5">Điểm học bạ / Xét tuyển</div>
                    <div className="text-xl font-black text-primary tracking-tighter">{candidate.high_school_score || '0.00'}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Admission Path */}
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5" /> Nguyện vọng xét tuyển
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase">Ngành đăng ký</div>
                    <div className="text-sm font-black text-slate-800">{major.name}</div>
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Mã ngành: {major.code}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase">Phương thức</div>
                    <div className="text-xs font-bold text-slate-700 leading-relaxed">{method.name}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Documents */}
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Tài liệu minh chứng ({docs.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {docs.map((doc, i) => (
                  <a 
                    key={i} href={getDocUrl(doc.file_url)} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/[0.02] transition-all group shadow-sm"
                  >
                    <div className="w-9 h-9 bg-slate-50 flex items-center justify-center rounded-lg text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-slate-700 truncate group-hover:text-primary transition-colors">
                        {doc.document_type === 'transcript' ? 'Học bạ THPT' : doc.document_type === 'id_card' ? 'CCCD/CMND' : 'Bằng tốt nghiệp/Khác'}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                        Xác thực <ExternalLink className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </a>
                ))}
                {docs.length === 0 && (
                  <div className="col-span-full py-10 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl opacity-50">
                    <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Không tìm thấy tài liệu đính kèm</span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Side: Evaluation Form */}
          <div className="w-full md:w-[400px] p-6 bg-slate-50/30 flex flex-col justify-between">
            <div className="space-y-6">
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" /> Quy trình đánh giá
                </h3>
                
                {/* Status Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Trạng thái hồ sơ</label>
                    <div className="grid grid-cols-1 gap-2">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setFormData({...formData, status: opt.value})}
                          className={`flex items-center justify-between p-3 border transition-all rounded-xl text-left shadow-sm ${
                            formData.status === opt.value 
                              ? `${opt.color} border-slate-300 ring-2 ring-primary/10 scale-[1.02] z-10 font-bold` 
                              : 'bg-white border-slate-200 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'
                          }`}
                        >
                          <span className="text-xs">{opt.label}</span>
                          {formData.status === opt.value && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center justify-between">
                      <span>Đánh giá nội bộ</span>
                      <span className="text-[9px] lowercase opacity-50 italic font-medium">(chỉ admin mới thấy)</span>
                    </label>
                    <textarea 
                      value={formData.adminNotes}
                      onChange={(e) => setFormData({...formData, adminNotes: e.target.value})}
                      placeholder="Ghi chú về điểm số, tính xác thực của hồ sơ..."
                      rows={5}
                      className="w-full bg-white border border-slate-200 p-4 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all rounded-2xl shadow-inner-sm resize-none"
                    />
                  </div>

                  {/* Public Feedback */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center justify-between">
                      <span>Phản hồi cho thí sinh</span>
                      <span className="text-[9px] lowercase opacity-50 italic font-medium">(thí sinh sẽ thấy text này)</span>
                    </label>
                    <textarea 
                      value={formData.note}
                      onChange={(e) => setFormData({...formData, note: e.target.value})}
                      placeholder="Lý do từ chối hoặc yêu cầu bổ sung chi tiết..."
                      rows={3}
                      className="w-full bg-white border border-slate-200 p-4 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all rounded-2xl shadow-inner-sm resize-none"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu kết quả đánh giá
              </button>
              <button 
                onClick={onClose}
                className="w-full bg-white text-slate-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
