import { useState, useEffect } from 'react';
import { Plus, Building2, AlertTriangle } from 'lucide-react';
import { DataTable, DataFormModal, ConfirmDialog } from '../components/common';
import api from '../services/api';

const AdminFaculties = () => {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null, message: '' });
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        introduction: '',
        logo_url: ''
    });

    useEffect(() => {
        loadFaculties();
    }, []);

    const loadFaculties = async () => {
        try {
            const response = await api.get('/admin/faculties');
            setFaculties(response.data || []);
        } catch (error) {
            console.error('Error loading faculties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFaculty) {
                await api.put(`/admin/faculties/${editingFaculty.id}`, formData);
            } else {
                await api.post('/admin/faculties', formData);
            }
            loadFaculties();
            closeModal();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        const faculty = faculties.find(f => f.id === id);
        const majorCount = faculty?.Majors?.length || 0;
        
        let message = 'Bạn có chắc muốn xóa khoa này?';
        if (majorCount > 0) {
            message = `⚠️ CẢNH BÁO: Khoa này có ${majorCount} ngành đào tạo!\n\nKhông thể xóa khoa khi còn ngành. Vui lòng:\n1. Xóa hoặc chuyển ${majorCount} ngành sang khoa khác\n2. Sau đó mới xóa khoa này`;
        }
        
        setConfirmDialog({
            isOpen: true,
            id,
            message,
            majorCount
        });
    };

    const confirmDelete = async () => {
        const { id, majorCount } = confirmDialog;
        try {
            await api.delete(`/admin/faculties/${id}`);
            alert('✅ Xóa khoa thành công!');
            loadFaculties();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            if (errorMsg.includes('existing majors')) {
                alert(`❌ KHÔNG THỂ XÓA!\n\nKhoa này có ${majorCount} ngành đào tạo.\n\nVui lòng xóa hoặc chuyển các ngành sang khoa khác trước khi xóa khoa.`);
            } else {
                alert('Lỗi khi xóa: ' + errorMsg);
            }
        }
    };

    const handleBulkDelete = async (ids) => {
        if (window.confirm(`Xóa ${ids.length} khoa đã chọn?`)) {
            try {
                const results = await Promise.allSettled(
                    ids.map(id => api.delete(`/admin/faculties/${id}`))
                );
                
                const failed = results.filter(r => r.status === 'rejected').length;
                if (failed > 0) {
                    alert(`Đã xóa ${ids.length - failed}/${ids.length} khoa.\n${failed} khoa không thể xóa vì còn ngành đào tạo.`);
                }
                
                loadFaculties();
            } catch (error) {
                alert('Lỗi khi xóa hàng loạt');
            }
        }
    };

    const openModal = (faculty = null) => {
        if (faculty) {
            setEditingFaculty(faculty);
            setFormData({ 
                name: faculty.name || '',
                code: faculty.code || '',
                introduction: faculty.introduction || '',
                logo_url: faculty.logo_url || ''
            });
        } else {
            setEditingFaculty(null);
            setFormData({ 
                name: '', 
                code: '', 
                introduction: '', 
                logo_url: '' 
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFaculty(null);
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Tên khoa', sortable: true },
        { key: 'code', label: 'Mã khoa', sortable: true },
        { key: 'slug', label: 'Slug', sortable: true },
        { 
            key: 'Majors', 
            label: 'Số ngành',
            render: (majors) => {
                const count = majors?.length || 0;
                return (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                        count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {count} ngành
                    </span>
                );
            }
        },
        { 
            key: 'createdAt', 
            label: 'Ngày tạo',
            render: (val) => new Date(val).toLocaleDateString('vi-VN')
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Building2 className="w-6 h-6" />
                    Quản lý Khoa
                </h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold hover:bg-primary-dark transition"
                >
                    <Plus className="w-5 h-5" />
                    Thêm khoa
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">Đang tải...</div>
            ) : (
                <>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <strong>Lưu ý:</strong> Không thể xóa khoa nếu còn ngành đào tạo. 
                                Vui lòng xóa hoặc chuyển các ngành sang khoa khác trước.
                            </div>
                        </div>
                    </div>
                    
                    <DataTable
                        columns={columns}
                        data={faculties}
                        onEdit={openModal}
                        onDelete={handleDelete}
                        onBulkDelete={handleBulkDelete}
                    />
                </>
            )}

            <DataFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingFaculty ? 'Sửa khoa' : 'Thêm khoa mới'}
                onSubmit={handleSubmit}
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Tên khoa *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Ví dụ: Khoa Công nghệ thông tin"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Slug sẽ tự động tạo từ tên khoa
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Mã khoa</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Ví dụ: CNTT"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Giới thiệu</label>
                        <textarea
                            value={formData.introduction}
                            onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Mô tả ngắn về khoa..."
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Logo URL</label>
                        <input
                            type="text"
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="/uploads/faculties/logo.png"
                        />
                    </div>
                </div>
            </DataFormModal>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, id: null, message: '' })}
                onConfirm={confirmDelete}
                title="Xác nhận xóa khoa"
                message={confirmDialog.message}
            />
        </div>
    );
};

export default AdminFaculties;
