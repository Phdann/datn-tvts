import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { majorService } from '../services';
import { Search, BookOpen, Edit, Plus, Trash2 } from 'lucide-react';
import { DataFormModal } from '../components/common';
import api from '../services/api';

const AdminMajorList = () => {
    const [majors, setMajors] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [filteredSpecializations, setFilteredSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        faculty_id: '',
        specialization_id: '',
        tuition: '',
        quota: '',
        description: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (formData.faculty_id) {
            const filtered = specializations.filter(s => s.faculty_id == formData.faculty_id);
            setFilteredSpecializations(filtered);
            if (formData.specialization_id) {
                const isValid = filtered.some(s => s.id == formData.specialization_id);
                if (!isValid) {
                    setFormData(prev => ({ ...prev, specialization_id: '' }));
                }
            }
        } else {
            setFilteredSpecializations([]);
            setFormData(prev => ({ ...prev, specialization_id: '' }));
        }
    }, [formData.faculty_id, specializations]);

    const loadData = async () => {
        try {
            const [majorsData, facultiesData, specializationsData] = await Promise.all([
                majorService.getAdminMajors({ limit: 100 }),
                api.get('/admin/faculties'),
                api.get('/admin/specializations')
            ]);
            setMajors(majorsData.data || []);
            setFaculties(facultiesData.data || []);
            setSpecializations(specializationsData.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await majorService.createMajor(formData);
            loadData();
            closeModal();
        } catch (error) {
            alert('Lỗi khi tạo ngành: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ngành này?')) {
            try {
                await majorService.deleteMajor(id);
                setMajors(majors.filter(m => m.id !== id));
            } catch (error) {
                alert('Lỗi khi xóa ngành: ' + error.message);
            }
        }
    };

    const openModal = () => {
        setFormData({ 
            code: '', 
            name: '', 
            faculty_id: '', 
            specialization_id: '',
            tuition: '', 
            quota: '', 
            description: '' 
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const filtered = majors.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <span>Quản lý Ngành đào tạo</span>
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Tìm mã hoặc tên ngành..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={openModal}
                        className="bg-primary hover:bg-primary-dark text-white p-2 rounded-xl transition shadow-md flex items-center gap-2 px-4 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline font-bold">Thêm mới</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-400">Đang tải dữ liệu...</div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 italic">
                        Không tìm thấy ngành nào
                    </div>
                ) : filtered.map(major => (
                    <div key={major.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-blue-50 text-[#00558d] rounded-lg">
                                    {major.code}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link 
                                        to={`/admin/majors/${major.id}`}
                                        className="p-2 text-primary hover:bg-blue-50 rounded-lg transition"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(major.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                {major.name}
                            </h3>
                            <p className="text-slate-500 text-xs italic mb-4">
                                {major.Faculty?.name || 'Chưa phân khoa'}
                            </p>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs">
                            <div className="flex flex-col">
                                <span className="text-slate-400">Chỉ tiêu</span>
                                <span className="font-bold text-slate-700">{major.quota || 0}</span>
                            </div>
                            <Link 
                                to={`/admin/majors/${major.id}`}
                                className="font-black text-[#00558d] uppercase tracking-tighter hover:underline"
                            >
                                Chi tiết & Nội dung →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <DataFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Thêm ngành đào tạo mới"
                onSubmit={handleSubmit}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 border-l-4 border-primary">
                        <p className="text-sm text-slate-700">
                            <strong>Cấu trúc phân cấp:</strong> Khoa → Chuyên ngành → Ngành đào tạo
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Khoa *</label>
                        <select
                            value={formData.faculty_id}
                            onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            <option value="">-- Chọn khoa --</option>
                            {faculties.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Chuyên ngành</label>
                        <select
                            value={formData.specialization_id}
                            onChange={(e) => setFormData({ ...formData, specialization_id: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={!formData.faculty_id}
                        >
                            <option value="">-- Chọn chuyên ngành (tùy chọn) --</option>
                            {filteredSpecializations.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {!formData.faculty_id && (
                            <p className="text-xs text-slate-500 mt-1 italic">Vui lòng chọn Khoa trước</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Mã ngành *</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Ví dụ: 7480201"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Tên ngành *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Ví dụ: Công nghệ thông tin"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Học phí (VNĐ)</label>
                            <input
                                type="number"
                                value={formData.tuition}
                                onChange={(e) => setFormData({ ...formData, tuition: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="15000000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Chỉ tiêu</label>
                            <input
                                type="number"
                                value={formData.quota}
                                onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            rows="4"
                            placeholder="Mô tả về ngành đào tạo..."
                        />
                    </div>
                </div>
            </DataFormModal>
        </div>
    );
};

export default AdminMajorList;
