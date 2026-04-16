import { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { DataTable, DataFormModal, StatusBadge } from '../components/common';
import api from '../services/api';
import facultyService from '../services/facultyService';

const AdminBanners = () => {
    const [banners, setBanners] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        link_url: '',
        display_order: 0,
        is_active: true,
        start_date: '',
        end_date: '',
        faculty_id: '', // Empty string for 'Main Site' (null in DB)
        position: 'main_top'
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        loadBanners();
        loadFaculties();
    }, []);

    const loadFaculties = async () => {
        try {
            const data = await facultyService.getFaculties({});
            setFaculties(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error('Error loading faculties:', error);
        }
    };

    const loadBanners = async () => {
        try {
            const response = await api.get('/admin/banners');
            setBanners(response.data || []);
        } catch (error) {
            console.error('Error loading banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'faculty_id') {
                     formDataToSend.append(key, formData[key] || '');
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });
            if (imageFile) {
                formDataToSend.append('image_url', imageFile);
            }

            if (editingBanner) {
                await api.put(`/admin/banners/${editingBanner.id}`, formDataToSend);
            } else {
                await api.post('/admin/banners', formDataToSend);
            }

            loadBanners();
            closeModal();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa banner này?')) {
            try {
                await api.delete(`/admin/banners/${id}`);
                loadBanners();
            } catch (error) {
                alert('Lỗi khi xóa');
            }
        }
    };

    const handleBulkDelete = async (ids) => {
        try {
            await Promise.all(ids.map(id => api.delete(`/admin/banners/${id}`)));
            loadBanners();
        } catch (error) {
            alert('Lỗi khi xóa hàng loạt');
        }
    };

    const updateOrder = async (id, newOrder) => {
        try {
            await api.patch(`/admin/banners/${id}/order`, { display_order: newOrder });
            loadBanners();
        } catch (error) {
            alert('Lỗi khi cập nhật thứ tự');
        }
    };

    const openModal = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title || '',
                link_url: banner.link_url || '',
                display_order: banner.display_order || 0,
                is_active: banner.is_active,
                start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
                end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
                faculty_id: banner.faculty_id || '',
                position: banner.position || 'main_top'
            });
        } else {
            setEditingBanner(null);
            setFormData({
                title: '',
                link_url: '',
                display_order: 0,
                is_active: true,
                start_date: '',
                end_date: '',
                faculty_id: '',
                position: 'main_top'
            });
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBanner(null);
        setImageFile(null);
    };

    const getFacultyName = (id) => {
        if (!id) return 'Trang chủ (Chung)';
        const fac = faculties.find(f => f.id === id);
        return fac ? `Khoa ${fac.name}` : 'Unknown';
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: true },
        { 
            key: 'image_url', 
            label: 'Ảnh',
            render: (val) => val ? (
                <img src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${val}`} alt="Banner" className="h-12 w-20 object-cover rounded" />
            ) : '-'
        },
        { key: 'title', label: 'Tiêu đề' },
        { 
            key: 'faculty_id', 
            label: 'Vị trí / Khoa',
            render: (val, row) => (
                <div className="flex flex-col text-xs">
                    <span className="font-bold text-slate-700">{getFacultyName(val)}</span>
                    <span className="text-slate-500 italic">{row.position}</span>
                </div>
            )
        },
        { 
            key: 'display_order', 
            label: 'Thứ tự',
            sortable: true,
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    <span className="font-bold">{val}</span>
                    <div className="flex gap-1">
                        <button onClick={() => updateOrder(row.id, val - 1)} className="p-1 hover:bg-slate-100 rounded">
                            <ArrowUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => updateOrder(row.id, val + 1)} className="p-1 hover:bg-slate-100 rounded">
                            <ArrowDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )
        },
        { 
            key: 'is_active', 
            label: 'Trạng thái',
            render: (val) => <StatusBadge status={val ? 'active' : 'inactive'} />
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <ImageIcon className="w-6 h-6" />
                    Quản lý Banner
                </h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold hover:bg-primary-dark transition rounded-lg shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Thêm banner
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">Đang tải...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={banners}
                    onEdit={openModal}
                    onDelete={handleDelete}
                    onBulkDelete={handleBulkDelete}
                />
            )}

            <DataFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingBanner ? 'Sửa banner' : 'Thêm banner mới'}
                onSubmit={handleSubmit}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div>
                            <label className="block text-sm font-bold mb-2">Hiển thị tại</label>
                            <select
                                value={formData.faculty_id}
                                onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">-- Trang chủ (Chung) --</option>
                                {faculties.map(fac => (
                                    <option key={fac.id} value={fac.id}>Khoa {fac.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Vị trí</label>
                            <select
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="main_top">Banner chính (Top)</option>
                                <option value="sidebar_right">Sidebar phải</option>
                                <option value="content_bottom">Cuối trang</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Tiêu đề</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Nhập tiêu đề banner..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Ảnh banner * {!editingBanner && '(Bắt buộc)'}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="w-full px-4 py-2 border border-slate-200 rounded"
                            required={!editingBanner}
                        />
                        <p className="text-xs text-slate-500 mt-1">Khuyên dùng: 1920x600px cho banner chính.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Link đích (Tùy chọn)</label>
                        <input
                            type="url"
                            value={formData.link_url}
                            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Thứ tự</label>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="col-span-2 flex items-center pt-8">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold cursor-pointer select-none">Kích hoạt hiển thị</label>
                            </div>
                        </div>
                    </div>
                </div>
            </DataFormModal>
        </div>
    );
};

export default AdminBanners;
