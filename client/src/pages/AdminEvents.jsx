import { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { DataTable, DataFormModal, StatusBadge } from '../components/common';
import api from '../services/api';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        event_date: '',
        end_date: '',
        status: 'upcoming',
        registration_link: ''
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const response = await api.get('/admin/events');
            setEvents(response.data.data || []);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) formDataToSend.append(key, formData[key]);
            });
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            if (editingEvent) {
                await api.put(`/admin/events/${editingEvent.id}`, formDataToSend);
            } else {
                await api.post('/admin/events', formDataToSend);
            }

            loadEvents();
            closeModal();
        } catch (error) {
            alert('Lỗi: ' + error.response?.data?.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa sự kiện này?')) {
            try {
                await api.delete(`/admin/events/${id}`);
                loadEvents();
            } catch (error) {
                alert('Lỗi khi xóa');
            }
        }
    };

    const handleBulkDelete = async (ids) => {
        try {
            await Promise.all(ids.map(id => api.delete(`/admin/events/${id}`)));
            loadEvents();
        } catch (error) {
            alert('Lỗi khi xóa hàng loạt');
        }
    };

    const openModal = (event = null) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                title: event.title,
                description: event.description || '',
                location: event.location || '',
                event_date: event.event_date ? event.event_date.split('T')[0] : '',
                end_date: event.end_date ? event.end_date.split('T')[0] : '',
                status: event.status,
                registration_link: event.registration_link || ''
            });
        } else {
            setEditingEvent(null);
            setFormData({
                title: '',
                description: '',
                location: '',
                event_date: '',
                end_date: '',
                status: 'upcoming',
                registration_link: ''
            });
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
        setImageFile(null);
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'title', label: 'Tên sự kiện', sortable: true },
        { key: 'location', label: 'Địa điểm' },
        { 
            key: 'event_date', 
            label: 'Ngày diễn ra',
            render: (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '-'
        },
        { 
            key: 'status', 
            label: 'Trạng thái',
            render: (val) => <StatusBadge status={val} />
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Quản lý Sự kiện
                </h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold hover:bg-primary-dark transition"
                >
                    <Plus className="w-5 h-5" />
                    Thêm sự kiện
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">Đang tải...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={events}
                    onEdit={openModal}
                    onDelete={handleDelete}
                    onBulkDelete={handleBulkDelete}
                />
            )}

            <DataFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingEvent ? 'Sửa sự kiện' : 'Thêm sự kiện mới'}
                onSubmit={handleSubmit}
                size="lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Tên sự kiện *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            rows="4"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Ngày bắt đầu *</label>
                            <input
                                type="date"
                                value={formData.event_date}
                                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Ngày kết thúc</label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Địa điểm</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Link đăng ký</label>
                        <input
                            type="url"
                            value={formData.registration_link}
                            onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Ảnh sự kiện</label>
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
                            <option value="upcoming">Sắp diễn ra</option>
                            <option value="ongoing">Đang diễn ra</option>
                            <option value="completed">Đã kết thúc</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                </div>
            </DataFormModal>
        </div>
    );
};

export default AdminEvents;
