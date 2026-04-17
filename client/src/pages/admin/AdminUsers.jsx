import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Shield, Save, X, Search, UserCheck, RefreshCw } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../services/api';
import { userService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { navItems } from '../../layouts/AdminLayout';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', role_id: '', permissions: [] });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [search, setSearch] = useState('');
  const toast = useToast();

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  const fetch = async () => { 
    try { 
      setLoading(true); 
      setSelectedIds([]);
      const r = await api.get('/admin/users'); 
      setUsers(r.data?.data || (Array.isArray(r.data) ? r.data : [])); 
    } catch { 
      setUsers([]); 
    } 
    setLoading(false); 
  };
  
  const fetchRoles = async () => {
    try { const r = await api.get('/admin/roles'); setRoles(r.data || []); } catch { setRoles([]); }
  };

  useEffect(() => { fetch(); fetchRoles(); }, []);

  const del = async (id) => { 
    try { 
      await api.delete(`/admin/users/${id}`); 
      toast.success('Xoá người dùng thành công');
      fetch(); 
    } catch {
      toast.error('Lỗi khi xoá người dùng');
    } 
  };
  
  const handleDeleteClick = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const startEdit = (user) => {
    setEditingUser(user.id);
    setForm({
      email: user.email,
      password: '',
      role_id: user.role_id,
      permissions: Array.isArray(user.Role?.permissions) 
        ? user.Role.permissions 
        : (typeof user.Role?.permissions === 'string' ? JSON.parse(user.Role.permissions) : [])
    });
    setAdding(true);
  };

  const handleSave = async () => {
    try {
      if (form.role_id && form.permissions) {
        await api.put(`/admin/roles/${form.role_id}`, { permissions: form.permissions });
      }
      if (editingUser) {
        const payload = { email: form.email, role_id: form.role_id };
        if (form.password) payload.password = form.password;
        await userService.updateUser(editingUser, payload);
        toast.success('Cập nhật người dùng thành công');
      } else {
        await userService.createUser(form);
        toast.success('Tạo người dùng thành công');
      }
      setAdding(false);
      setEditingUser(null);
      setForm({ email: '', password: '', role_id: '', permissions: [] });
      fetch();
    } catch (e) { 
      toast.error('Lỗi khi lưu người dùng');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(u => u.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${selectedIds.length} tài khoản đã chọn?`)) return;
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/admin/users/${id}`)));
      toast.success(`Đã xoá ${selectedIds.length} tài khoản`);
      setSelectedIds([]);
      fetch();
    } catch {
      toast.error('Lỗi khi xoá hàng loạt');
    }
  };

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 flex items-center justify-center rounded-2xl shadow-sm">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-blue-950 tracking-tight uppercase">Quản lý Người dùng</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Hệ thống quản trị tài khoản</p>
          </div>
        </div>
        <button 
          onClick={() => {setEditingUser(null); setForm({ email:'', password:'', role_id:'', permissions:[] }); setAdding(true);}} 
          className="bg-primary text-white text-xs font-black px-6 py-3 flex items-center gap-2 hover:bg-primary/90 rounded-xl transition-all uppercase tracking-widest shadow-sm"
        >
          <Plus className="w-4 h-4" /> Thêm người dùng
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text" placeholder="Tìm kiếm theo email..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl transition-all bg-slate-50 focus:bg-white shadow-inner-sm"
            />
          </div>
          <button 
            type="button"
            onClick={fetch}
            className="p-3.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Đã chọn: <span className="text-primary">{selectedIds.length}</span> người dùng
            </p>
            <button 
              onClick={handleBulkDelete}
              className="bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xoá mục đã chọn
            </button>
          </div>
        )}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 rounded-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                {editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
              </h2>
              <button onClick={() => setAdding(false)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Basic Info */}
                <div className="md:col-span-1 space-y-5">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Thông tin cơ bản</h3>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Email đăng nhập</label>
                    <input 
                      type="email" 
                      value={form.email} 
                      onChange={e=>setForm(prev=>({...prev,email:e.target.value}))} 
                      className="w-full border border-slate-200 px-4 py-2.5 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all rounded-xl text-sm"
                      placeholder="admin@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Mật khẩu</label>
                    <input 
                      type="password" 
                      placeholder={editingUser ? 'Để trống nếu không đổi' : 'Nhập mật khẩu'} 
                      value={form.password} 
                      onChange={e=>setForm(prev=>({...prev,password:e.target.value}))} 
                      className="w-full border border-slate-200 px-4 py-2.5 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all rounded-xl text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Vai trò quản trị</label>
                    <select 
                      value={form.role_id} 
                      onChange={e=>{
                        const rid=e.target.value;
                        setForm(prev=>({
                          ...prev,
                          role_id:rid,
                          permissions: Array.isArray(roles.find(r=>r.id==rid)?.permissions) 
                            ? roles.find(r=>r.id==rid).permissions 
                            : [] 
                        }));
                      }} 
                      className="w-full border border-slate-200 px-4 py-2.5 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all bg-white rounded-xl text-sm font-bold"
                    >
                      <option value="">-- Chọn vai trò --</option>
                      {roles
                        .filter(r => r.name.toLowerCase() !== 'candidate' && r.name.toLowerCase() !== 'user')
                        .map(r=><option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)
                      }
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div className="md:col-span-2 space-y-5">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Quyền truy cập chức năng</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {navItems.map((group, idx) => (
                      <div key={idx} className="bg-slate-50/50 border border-slate-100 p-4 hover:border-primary/20 hover:bg-white transition-all group rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <group.icon className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{group.label}</span>
                        </div>
                        
                        <div className="space-y-2">
                          {/* Parent Permission */}
                          {group.to && (
                            <label className="flex items-center gap-2.5 cursor-pointer py-1 group/item">
                              <input 
                                type="checkbox" 
                                checked={Array.isArray(form.permissions) && form.permissions.includes(group.to)}
                                onChange={e => {
                                  let perms = [...form.permissions];
                                  if (e.target.checked) perms.push(group.to);
                                  else perms = perms.filter(p => p !== group.to);
                                  setForm(prev => ({ ...prev, permissions: perms }));
                                }}
                                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                              />
                              <span className="text-xs font-bold text-slate-600 group-hover/item:text-primary transition-colors">Xem {group.label}</span>
                            </label>
                          )}
                          
                          {/* Children Permissions */}
                          {group.children?.map((child, cIdx) => (
                            <label key={cIdx} className="flex items-center gap-2.5 ml-4 cursor-pointer py-1 group/item">
                              <input 
                                type="checkbox" 
                                checked={Array.isArray(form.permissions) && form.permissions.includes(child.to)}
                                onChange={e => {
                                  let perms = [...form.permissions];
                                  if (e.target.checked) perms.push(child.to);
                                  else perms = perms.filter(p => p !== child.to);
                                  setForm(prev => ({ ...prev, permissions: perms }));
                                }}
                                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                              />
                              <span className="text-[11px] font-bold text-slate-500 group-hover/item:text-slate-800 transition-colors">{child.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button 
                onClick={() => setAdding(false)} 
                className="px-6 py-2.5 border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Huỷ bỏ
              </button>
              <button 
                onClick={handleSave} 
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" /> {editingUser ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/50">
                <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  <th className="px-6 py-5 border-b border-slate-100 w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-5 border-b border-slate-100 w-12 text-center">STT</th>
                  <th className="px-4 py-5 border-b border-slate-100">Email người dùng</th>
                  <th className="px-4 py-5 border-b border-slate-100">Vai trò / Quyền</th>
                  <th className="px-4 py-5 border-b border-slate-100 whitespace-nowrap">Ngày khởi tạo</th>
                  <th className="px-4 py-5 border-b border-slate-100 text-center w-28 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u, idx) => (
                  <tr key={u.id} className={`border-t border-slate-100 hover:bg-slate-50 group transition-all ${selectedIds.includes(u.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(u.id)}
                        onChange={() => toggleSelectRow(u.id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</td>
                    <td className="px-4 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                             <UserCheck className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-700">{u.email}</span>
                       </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-widest border border-primary/10">
                        {u.Role?.name || u.role_id || 'Chưa xác định'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(u)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Chỉnh sửa">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Xoá tài khoản">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-32 text-center">
                       <div className="flex flex-col items-center gap-3 opacity-20">
                          <UserCheck className="w-16 h-16" />
                          <p className="font-black text-sm uppercase tracking-widest">{search ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào được tạo'}</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => del(confirmDelete.id)}
        title="Xoá người dùng"
        message="Bạn có chắc chắn muốn xoá người dùng này? Hành động này không thể hoàn tác."
        confirmText="Xoá ngay"
        type="danger"
      />
    </div>
  );
}
