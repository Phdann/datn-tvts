import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DataTable, DataFormModal, StatusBadge } from '../components/common';
import api from '../services/api';

const AdminNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        status: 'draft'
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        try {
            const response = await api.get('/admin/news');
            setNews(response.data.data || []);
        } catch (error) {
            console.error('Error loading news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });
            if (imageFile) {
                formDataToSend.append('featured_image', imageFile);
            }

            if (editingNews) {
                await api.put(`/admin/news/${editingNews.id}`, formDataToSend);
            } else {
                await api.post('/admin/news', formDataToSend);
            }

            loadNews();
            closeModal();
        } catch (error) {
            alert('Lỗi: ' + error.response?.data?.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa tin tức này?')) {
            try {
                await api.delete(`/admin/news/${id}`);
                loadNews();
            } catch (error) {
                alert('Lỗi khi xóa');
            }
        }
    };

    const handleBulkDelete = async (ids) => {
        try {
            await Promise.all(ids.map(id => api.delete(`/admin/news/${id}`)));
            loadNews();
        } catch (error) {
            alert('Lỗi khi xóa hàng loạt');
        }
    };

    const openModal = (newsItem = null) => {
        if (newsItem) {
            setEditingNews(newsItem);
            setFormData({
                title: newsItem.title,
                content: newsItem.content,
                excerpt: newsItem.excerpt || '',
                status: newsItem.status
            });
        } else {
            setEditingNews(null);
            setFormData({ title: '', content: '', excerpt: '', status: 'draft' });
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingNews(null);
        setFormData({ title: '', content: '', excerpt: '', status: 'draft' });
        setImageFile(null);
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'title', label: 'Tiêu đề', sortable: true },
        { 
            key: 'status', 
            label: 'Trạng thái',
            render: (val) => <StatusBadge status={val} />
        },
        { key: 'views', label: 'Lượt xem', sortable: true },
        { 
            key: 'createdAt', 
            label: 'Ngày tạo',
            render: (val) => new Date(val).toLocaleDateString('vi-VN')
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Quản lý Tin tức</h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold hover:bg-primary-dark transition"
                >
                    <Plus className="w-5 h-5" />
                    Thêm tin tức
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">Đang tải...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={news}
                    onEdit={openModal}
                    onDelete={handleDelete}
                    onBulkDelete={handleBulkDelete}
                />
            )}

            <DataFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingNews ? 'Sửa tin tức' : 'Thêm tin tức mới'}
                onSubmit={handleSubmit}
                size="lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Tiêu đề</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Tóm tắt</label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Nội dung</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            rows="10"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Ảnh đại diện</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="w-full px-4 py-2 border border-slate-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Trạng thái</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="draft">Nháp</option>
                            <option value="published">Xuất bản</option>
                            <option value="archived">Lưu trữ</option>
                        </select>
                    </div>
                </div>
            </DataFormModal>
        </div>
    );
};

export default AdminNews;
