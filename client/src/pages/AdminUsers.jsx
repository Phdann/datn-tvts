import { useState, useEffect } from 'react';
import { Plus, Lock, Unlock, Edit, Trash2, Key } from 'lucide-react';
import { DataTable, DataFormModal, StatusBadge } from '../components/common';
import userService from '../services/userService';
import api from '../services/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role_id: ''
    });
    const [passwordData, setPasswordData] = useState({
        userId: null,
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersData, rolesData] = await Promise.all([
                userService.getAllUsers(),
                api.get('/admin/roles')
            ]);
            setUsers(usersData.data || []);
            setRoles(rolesData.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userService.updateUser(editingUser.id, formData);
            } else {
                await userService.createUser(formData);
            }
            loadData();
            closeModal();
        } catch (error) {
            alert('Lỗi: ' + error.response?.data?.message);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }
        try {
            await userService.changePassword(passwordData.userId, {
                newPassword: passwordData.newPassword
            });
            alert('Đổi mật khẩu thành công');
            closePasswordModal();
        } catch (error) {
            alert('Lỗi: ' + error.response?.data?.message);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            if (user.status === 'active') {
                await userService.lockUser(user.id);
            } else {
                await userService.unlockUser(user.id);
            }
            loadData();
        } catch (error) {
            alert('Lỗi khi thay đổi trạng thái: ' + error.response?.data?.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa người dùng này?')) {
            try {
                await userService.deleteUser(id);
                loadData();
            } catch (error) {
                alert('Lỗi khi xóa: ' + error.response?.data?.message);
            }
        }
    };

    const handleBulkDelete = async (ids) => {
        try {
            await Promise.all(ids.map(id => userService.deleteUser(id)));
            loadData();
        } catch (error) {
            alert('Lỗi khi xóa hàng loạt');
        }
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                email: user.email,
                password: '',
                role_id: user.role_id
            });
        } else {
            setEditingUser(null);
            setFormData({ email: '', password: '', role_id: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const openPasswordModal = (userId) => {
        setPasswordData({ userId, newPassword: '', confirmPassword: '' });
        setIsPasswordModalOpen(true);
    };

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setPasswordData({ userId: null, newPassword: '', confirmPassword: '' });
    };

    const getRoleBadge = (roleName) => {
        const colors = {
            'Admin': 'bg-red-100 text-red-600',
            'Staff': 'bg-blue-100 text-blue-600',
            'Candidate': 'bg-gray-100 text-gray-600'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors[roleName] || 'bg-gray-100 text-gray-600'}`}>
                {roleName}
            </span>
        );
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { 
            key: 'Role', 
            label: 'Vai trò',
            render: (val) => getRoleBadge(val?.name || 'CANDIDATE')
        },
        { 
            key: 'status', 
            label: 'Trạng thái',
            render: (val, row) => (
                <button
                    onClick={() => handleToggleStatus(row)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        val === 'active' 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                >
                    {val === 'active' ? 'Hoạt động' : 'Đã khóa'}
                </button>
            )
        },
        { 
            key: 'last_login', 
            label: 'Đăng nhập cuối',
            render: (val) => val ? new Date(val).toLocaleString('vi-VN') : 'Chưa đăng nhập'
        },
        {
            key: 'actions',
            label: 'Hành động',
            render: (val, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openPasswordModal(row.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                        title="Đổi mật khẩu"
                    >
                        <Key className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Quản lý Người dùng</h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold hover:bg-primary-dark transition"
                >
                    <Plus className="w-5 h-5" />
                    Thêm người dùng
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">Đang tải...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={users}
                    onEdit={openModal}
                    onDelete={handleDelete}
                    onBulkDelete={handleBulkDelete}
                />
            )}

            <DataFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
                onSubmit={handleSubmit}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            disabled={editingUser}
                        />
                    </div>

                    {!editingUser && (
                        <div>
                            <label className="block text-sm font-bold mb-2">Mật khẩu *</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-2">Vai trò *</label>
                        <select
                            value={formData.role_id}
                            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            <option value="">-- Chọn vai trò --</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </DataFormModal>

            <DataFormModal
                isOpen={isPasswordModalOpen}
                onClose={closePasswordModal}
                title="Đổi mật khẩu"
                onSubmit={handlePasswordSubmit}
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Mật khẩu mới *</label>
                        <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Xác nhận mật khẩu *</label>
                        <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                </div>
            </DataFormModal>
        </div>
    );
};

export default AdminUsers;
