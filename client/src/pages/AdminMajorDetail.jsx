import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { majorService } from '../services';
import { 
    Save, ArrowLeft, Upload, Trash2, GripVertical, 
    Image as ImageIcon, Info, CheckCircle2, X 
} from 'lucide-react';

const AdminMajorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [activeTab, setActiveTab] = useState('images');
    const [major, setMajor] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadMajorData();
        loadMajorImages();
    }, [id]);

    const loadMajorData = async () => {
        try {
            const data = await majorService.getAdminMajorById(id);
            setMajor(data);
        } catch (error) {
            console.error('Error loading major:', error);
        }
    };

    const loadMajorImages = async () => {
        try {
            const data = await majorService.getMajorImages(id);
            setImages(data);
        } catch (error) {
            console.error('Error loading images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('images', file);
        });

        try {
            await majorService.uploadMajorImages(id, formData);
            await loadMajorImages(); 
        } catch (error) {
            alert('Lỗi khi upload: ' + error.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
            try {
                await majorService.deleteMajorImage(imageId);
                setImages(images.filter(img => img.id !== imageId));
            } catch (error) {
                alert('Lỗi khi xóa ảnh: ' + error.message);
            }
        }
    };

    const handleOrderChange = async (imageId, newOrder) => {
        try {
            const displayOrder = parseInt(newOrder) || 0;
            await majorService.updateImageOrder(imageId, displayOrder);
            setImages(images.map(img => img.id === imageId ? { ...img, display_order: displayOrder } : img)
                .sort((a, b) => a.display_order - b.display_order));
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    if (loading && !major) return <div className="p-20 text-center">Đang tải...</div>;

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/majors')}
                        className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{major?.name}</h2>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">{major?.code}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-50 transition shadow-sm">
                        Hủy
                    </button>
                    <button 
                        className="bg-primary text-white font-bold px-8 py-2.5 rounded-xl hover:bg-primary-dark transition shadow-md flex items-center gap-2"
                        onClick={() => {}} 
                    >
                        <Save className="w-5 h-5" />
                        Lưu thay đổi
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 gap-8">
                <button 
                    className={`pb-4 px-2 font-bold text-sm transition-all focus:outline-none ${activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => setActiveTab('info')}
                >
                    Thông tin cơ bản
                </button>
                <button 
                    className={`pb-4 px-2 font-bold text-sm transition-all focus:outline-none ${activeTab === 'images' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => setActiveTab('images')}
                >
                    Quản lý Nội dung Ảnh (CMS)
                </button>
            </div>

            {activeTab === 'info' ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Tên ngành</label>
                            <input type="text" defaultValue={major?.name} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Mã ngành</label>
                            <input type="text" defaultValue={major?.code} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div className="p-4 bg-blue-50 border-l-4 border-primary flex gap-3 rounded-r-xl">
                        <Info className="w-5 h-5 text-primary shrink-0" />
                        <p className="text-sm text-slate-600">
                            Trong Phase 11, chúng tôi tập trung vào quản lý nội dung ảnh. Vui lòng chuyển sang tab <strong>Quản lý Nội dung Ảnh</strong> để cấu hình giao diện stacked images cho ngành này.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <ImageIcon className="w-6 h-6 text-primary" />
                                    <span>Danh sách Hình ảnh Nội dung</span>
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Các ảnh sẽ được hiển thị xếp chồng từ trên xuống dưới theo thứ tự.</p>
                            </div>
                            <div>
                                <input 
                                    type="file" 
                                    multiple 
                                    hidden 
                                    ref={fileInputRef} 
                                    accept="image/*"
                                    onChange={handleUpload}
                                />
                                <button 
                                    disabled={uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-[#007d75] hover:bg-[#006a64] text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2"
                                >
                                    {uploading ? 'Đang tải lên...' : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Upload Ảnh (Multi)
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {images.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Chưa có ảnh nội dung nào cho ngành này.</p>
                                <p className="text-sm text-slate-400 mt-1">Hãy upload ảnh để bắt đầu xây dựng nội dung trang.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {images.map((img, index) => (
                                    <div 
                                        key={img.id} 
                                        className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-primary/30 hover:bg-white transition-all shadow-sm"
                                    >
                                        <div className="text-slate-300">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className="w-32 h-20 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                            <img 
                                                src={`${API_URL}${img.image_url}`} 
                                                alt="Preview" 
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Thứ tự hiển thị (#{(index + 1)})</p>
                                            <input 
                                                type="number" 
                                                value={img.display_order} 
                                                onChange={(e) => handleOrderChange(img.id, e.target.value)}
                                                className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-[#00558d] focus:ring-1 focus:ring-primary outline-none"
                                            />
                                        </div>
                                        <div className="flex-grow hidden md:block">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">URL Ảnh</p>
                                            <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{img.image_url}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteImage(img.id)}
                                            className="p-3 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition"
                                            title="Xóa ảnh"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="mt-8 flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-2xl text-sm italic">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            Thay đổi thứ tự hoặc xóa ảnh sẽ có hiệu lực ngay lập tức trên trang Public.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMajorDetail;
