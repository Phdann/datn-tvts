import { useState, useEffect, useRef } from 'react';
import { Save, FileText, CheckCircle, AlertCircle, Upload, RefreshCw, Tag, Calendar, Database, Layers, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function AdminChatData() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const fileInputRef = useRef(null);
    
    const [majors, setMajors] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        admission_year: new Date().getFullYear(),
        content_type: 'quy_che',
        major: '',
        source: '',
        data_status: 'active',
        keywords: ''
    });

    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const res = await api.get('/majors');
             
                let majorList = [];
                
                if (Array.isArray(res.data)) {
                    majorList = res.data;
                } else if (res.data && Array.isArray(res.data.data)) {
                    majorList = res.data.data; 
                } else if (res.data && Array.isArray(res.data.rows)) {
                    majorList = res.data.rows; 
                }
                setMajors(majorList);
            } catch (err) {
                console.error("Không tải được danh sách ngành", err);
                setMajors([]);
            }
        };
        fetchMajors();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setFormData(prev => ({ ...prev, content: event.target.result }));
        };
        reader.readAsText(file);
    };

    const handleIngest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
           
            
            const enrichedContent = `
=== METADATA ===
Tiêu đề: ${formData.title}
Năm tuyển sinh: ${formData.admission_year}
Loại thông tin: ${getContentTypeLabel(formData.content_type)}
Ngành học: ${formData.major || 'Áp dụng chung'}
Trạng thái: ${formData.data_status}
Từ khóa: ${formData.keywords}
================
${formData.content}
            `.trim();

            const enrichedSource = `[${formData.content_type.toUpperCase()}] ${formData.source || formData.title}`;

            await api.post('/admin/chat-data/ingest', {
                title: enrichedSource,
                content: enrichedContent
            });

            setStatus('success');
            
            setFormData(prev => ({
                ...prev,
                title: '',
                content: '',
                keywords: ''
            }));
            if (fileInputRef.current) fileInputRef.current.value = "";
            
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const getContentTypeLabel = (type) => {
        const map = {
            quy_che: 'Quy chế tuyển sinh',
            nganh_hoc: 'Thông tin ngành học',
            hoc_phi: 'Học phí & Lệ phí',
            diem_chuan: 'Điểm chuẩn',
            phuong_thuc_xet_tuyen: 'Phương thức xét tuyển',
            hoc_bong: 'Học bổng & Chính sách',
            faq: 'Câu hỏi thường gặp (FAQ)'
        };
        return map[type] || type;
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Link to="/admin/chat-data" className="inline-flex items-center text-gray-500 hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại danh sách
            </Link>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Database className="w-8 h-8 mr-3 text-primary" />
                    Quản lý Dữ liệu Chatbot
                </h1>
                <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200">
                    Knowledge Base System
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold mb-4 flex items-center text-gray-700 border-b pb-2">
                        <FileText className="w-5 h-5 mr-2 text-primary" />
                        Nạp dữ liệu mới
                    </h2>

                    {status === 'success' && (
                        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center animate-in fade-in">
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" /> 
                            <div>
                                <strong>Thành công!</strong> Dữ liệu đã được mã hóa và lưu vào Vector DB.
                            </div>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center animate-in fade-in">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <div>Lỗi kết nối Server. Vui lòng thử lại.</div>
                        </div>
                    )}

                    <form onSubmit={handleIngest} className="space-y-5">
        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề dữ liệu <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="title"
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    placeholder="VD: Thông báo tuyển sinh đợt 1 năm 2026"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" /> Năm tuyển sinh
                                </label>
                                <select 
                                    name="admission_year"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                                    value={formData.admission_year}
                                    onChange={handleChange}
                                >
                                    {[2023, 2024, 2025, 2026, 2027].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Loại nội dung</label>
                                <select 
                                    name="content_type"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                                    value={formData.content_type}
                                    onChange={handleChange}
                                >
                                    <option value="quy_che">Quy chế tuyển sinh</option>
                                    <option value="nganh_hoc">Thông tin ngành học</option>
                                    <option value="hoc_phi">Học phí & Lệ phí</option>
                                    <option value="diem_chuan">Điểm chuẩn</option>
                                    <option value="phuong_thuc_xet_tuyen">Phương thức xét tuyển</option>
                                    <option value="hoc_bong">Học bổng</option>
                                    <option value="faq">Câu hỏi thường gặp (FAQ)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Ngành học (Tùy chọn)</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        list="majors-list"
                                        name="major"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Chọn hoặc nhập tên ngành..."
                                        value={formData.major}
                                        onChange={handleChange}
                                    />
                                    <datalist id="majors-list">
                                        {Array.isArray(majors) && majors.length > 0 && majors.map((m) => (
                <option key={m.id || m.code} value={m.name} />
            ))}
                                    </datalist>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-gray-700">Nội dung chi tiết <span className="text-red-500">*</span></label>
                                <label className="cursor-pointer text-xs text-primary hover:text-primary-dark flex items-center bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors">
                                    <Upload className="w-3 h-3 mr-1" />
                                    Tải file text (.txt, .md)
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className="hidden" 
                                        accept=".txt,.md,.json"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </div>
                            <textarea 
                                name="content"
                                required
                                rows={10}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm leading-relaxed"
                                placeholder="Dán nội dung vào đây hoặc tải file lên..."
                                value={formData.content}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                                <Layers className="w-3 h-3 mr-1" /> Thông tin bổ trợ (Metadata)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Nguồn thông tin (Source)</label>
                                    <input 
                                        type="text" 
                                        name="source"
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                        placeholder="VD: Đề án tuyển sinh 2026 - Bộ GDĐT"
                                        value={formData.source}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái dữ liệu</label>
                                    <select 
                                        name="data_status"
                                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                                        value={formData.data_status}
                                        onChange={handleChange}
                                    >
                                        <option value="active">🟢 Sử dụng ngay</option>
                                        <option value="draft">🟡 Bản nháp</option>
                                        <option value="archived">🔴 Lưu trữ</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
                                        <Tag className="w-3 h-3 mr-1" /> Từ khóa trọng tâm (Keywords)
                                    </label>
                                    <input 
                                        type="text" 
                                        name="keywords"
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                        placeholder="VD: chất lượng cao, liên kết quốc tế, học bổng tài năng..."
                                        value={formData.keywords}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center font-bold shadow-lg shadow-primary/30"
                            >
                                {loading ? (
                                    <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Đang xử lý Embedding...</>
                                ) : (
                                    <><Save className="w-5 h-5 mr-2" /> Lưu vào Knowledge Base</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                        <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                            <Database className="w-4 h-4 mr-2" />
                            Preview Dữ liệu Gửi đi
                        </h3>
                        <p className="text-sm text-blue-600 mb-3">
                            Dữ liệu sẽ được tự động đóng gói (Enrich) trước khi gửi cho AI để tăng độ chính xác khi truy vấn.
                        </p>
                        <div className="bg-white p-3 rounded border border-blue-200 text-xs font-mono text-gray-600 overflow-hidden text-ellipsis whitespace-pre-wrap max-h-60 overflow-y-auto">
                            <span className="text-gray-400">=== METADATA ===</span><br/>
                            <span className="text-purple-600">Tiêu đề:</span> {formData.title || '...'}<br/>
                            <span className="text-purple-600">Năm:</span> {formData.admission_year}<br/>
                            <span className="text-purple-600">Loại:</span> {getContentTypeLabel(formData.content_type)}<br/>
                            <span className="text-purple-600">Ngành:</span> {formData.major || 'Chung'}<br/>
                            <span className="text-gray-400">================</span><br/>
                            {formData.content ? formData.content.substring(0, 150) + '...' : '(Nội dung trống)'}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-3">Lưu ý khi nhập liệu</h3>
                        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                            <li>Nên chia nhỏ nội dung theo từng chủ đề (ví dụ: Học phí tách riêng với Điểm chuẩn).</li>
                            <li>Nếu nhập liệu cho <strong>Ngành học</strong>, hãy chọn đúng tên ngành để AI gợi ý chính xác.</li>
                            <li><strong>Từ khóa</strong> giúp AI tìm kiếm nhanh hơn (cách nhau bằng dấu phẩy).</li>
                            <li>File upload hỗ trợ định dạng text (.txt, .md).</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminChatData;