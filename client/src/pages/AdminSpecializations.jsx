import { useState, useEffect } from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import { DataTable, DataFormModal } from '../components/common';
import api from '../services/api';

const AdminSpecializations = () => {
    const [specializations, setSpecializations] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [majors, setMajors] = useState([]);
    const [filteredMajors, setFilteredMajors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSpec, setEditingSpec] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        major_id: '',  
        description: ''
    });
    const [selectedFacultyId, setSelectedFacultyId] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [specsRes, facultiesRes, majorsRes] = await Promise.all([
                api.get('/admin/specializations'),
                api.get('/admin/faculties'),
                api.get('/admin/majors')
            ]);
            setSpecializations(specsRes.data || []);
            setFaculties(facultiesRes.data || []);
            setMajors(majorsRes.data?.data || majorsRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFacultyChange = (facultyId) => {
        setSelectedFacultyId(facultyId);
        if (facultyId) {
            const filtered = majors.filter(m => m.faculty_id == facultyId);
            setFilteredMajors(filtered);
        } else {
            setFilteredMajors([]);
        }
        setFormData({ ...formData, major_id: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSpec) {
                await api.put(`/admin/specializations/${editingSpec.id}`, formData);
            } else {
                await api.post('/admin/specializations', formData);
            }
            loadData();
            closeModal();
        } catch (error) {
            alert('Lỗi: ' + error.response?.data?.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa chuyên ngành này?')) {
            try {
                await api.delete(`/admin/specializations/${id}`);
                loadData();
            } catch (error) {
                alert('Lỗi khi xóa');
            }
        }
    };

    const handleBulkDelete = async (ids) => {
        try {
            await Promise.all(ids.map(id => api.delete(`/admin/specializations/${id}`)));
            loadData();
        } catch (error) {
            alert('Lỗi khi xóa hàng loạt');
        }
    };

    const openModal = (spec = null) => {
        if (spec) {
            setEditingSpec(spec);
            const facultyId = spec.Major?.faculty_id || '';
            setSelectedFacultyId(facultyId);
            if (facultyId) {
                const filtered = majors.filter(m => m.faculty_id == facultyId);
                setFilteredMajors(filtered);
            }
            setFormData({
                name: spec.name,
                code: spec.code,
                major_id: spec.major_id,
                description: spec.description || ''
            });
        } else {
            setEditingSpec(null);
            setSelectedFacultyId('');
            setFilteredMajors([]);
            setFormData({ name: '', code: '', major_id: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSpec(null);
        setSelectedFacultyId('');
        setFilteredMajors([]);
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'code', label: 'Mã', sortable: true },
        { key: 'name', label: 'Tên chuyên ngành', sortable: true },
        { 
            key: 'Major', 
            label: 'Ngành',
            render: (val) => val?.name || '-'
        },
        { 
            key: 'Major.Faculty', 
            label: 'Khoa',
            render: (val, row) => row.Major?.Faculty?.name || '-'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <GraduationCap className="w-6 h-6" />
                    Quản lý Chuyên ngành
                </h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold hover:bg-primary-dark transition"
                >
                    <Plus className="w-5 h-5" />
                    Thêm chuyên ngành
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">Đang tải...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={specializations}
                    onEdit={openModal}
                    onDelete={handleDelete}
                    onBulkDelete={handleBulkDelete}
                />
            )}

            <DataFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingSpec ? 'Sửa chuyên ngành' : 'Thêm chuyên ngành mới'}
                onSubmit={handleSubmit}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Khoa *</label>
                        <select
                            value={selectedFacultyId}
                            onChange={(e) => handleFacultyChange(e.target.value)}
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
                        <label className="block text-sm font-bold mb-2">Ngành *</label>
                        <select
                            value={formData.major_id}
                            onChange={(e) => setFormData({ ...formData, major_id: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            disabled={!selectedFacultyId}
                        >
                            <option value="">-- Chọn ngành --</option>
                            {filteredMajors.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        {!selectedFacultyId && (
                            <p className="text-xs text-gray-500 mt-1">Vui lòng chọn khoa trước</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Mã chuyên ngành *</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Tên chuyên ngành *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                </div>
            </DataFormModal>
        </div>
    );
};

export default AdminSpecializations;
