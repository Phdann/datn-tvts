import { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, Zap, Bot, Shield } from 'lucide-react';
import { FlatTabs, PrimaryButton, LoadingSpinner } from '../components/common';
import settingsService from '../services/settingsService';

const AdminSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await settingsService.getAllSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        
        try {
            const updates = {};
            Object.keys(settings).forEach(key => {
                updates[key] = settings[key].value;
            });

            await settingsService.updateSettings(updates);
            setMessage({ type: 'success', text: '✅ Cập nhật cấu hình thành công!' });
            
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Lỗi khi cập nhật: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                value
            }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
            </div>
        );
    }

    const tabs = [
        {
            label: 'Chung',
            icon: SettingsIcon,
            content: (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Tên trường *</label>
                        <input
                            type="text"
                            value={settings?.university_name?.value || ''}
                            onChange={(e) => updateSetting('university_name', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Đại học Kinh tế - Đại học Đà Nẵng"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Hotline *</label>
                            <input
                                type="text"
                                value={settings?.hotline?.value || ''}
                                onChange={(e) => updateSetting('hotline', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0236 3836 169"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Email *</label>
                            <input
                                type="email"
                                value={settings?.email?.value || ''}
                                onChange={(e) => updateSetting('email', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="tuyensinh@due.edu.vn"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Địa chỉ</label>
                        <input
                            type="text"
                            value={settings?.address?.value || ''}
                            onChange={(e) => updateSetting('address', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="71 Ngũ Hành Sơn, Đà Nẵng, Việt Nam"
                        />
                    </div>
                </div>
            )
        },
        {
            label: 'Tuyển sinh',
            icon: Zap,
            content: (
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                            <p className="font-bold text-slate-900">Trạng thái nhận hồ sơ</p>
                            <p className="text-sm text-slate-500">Cho phép thí sinh nộp hồ sơ trực tuyến</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings?.admission_open?.value || false}
                                onChange={(e) => updateSetting('admission_open', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Năm tuyển sinh</label>
                            <input
                                type="number"
                                value={settings?.current_year?.value || 2025}
                                onChange={(e) => updateSetting('current_year', parseInt(e.target.value))}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Hạn chót nộp hồ sơ</label>
                            <input
                                type="date"
                                value={settings?.admission_deadline?.value || ''}
                                onChange={(e) => updateSetting('admission_deadline', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            label: 'AI Chatbot',
            icon: Bot,
            content: (
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                            <p className="font-bold text-slate-900">Kích hoạt Gemini AI</p>
                            <p className="text-sm text-slate-500">Bật/tắt chatbot tư vấn tuyển sinh</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings?.gemini_enabled?.value || false}
                                onChange={(e) => updateSetting('gemini_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">System Prompt cho Gemini</label>
                        <p className="text-xs text-slate-500 mb-3">
                            Hướng dẫn AI cách trả lời câu hỏi của thí sinh
                        </p>
                        <textarea
                            value={settings?.gemini_system_prompt?.value || ''}
                            onChange={(e) => updateSetting('gemini_system_prompt', e.target.value)}
                            rows={10}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                            placeholder="Bạn là trợ lý tư vấn tuyển sinh..."
                        />
                    </div>
                </div>
            )
        },
        {
            label: 'Nâng cao',
            icon: Shield,
            content: (
                <div className="space-y-6">
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
                        <p className="text-amber-800 font-bold flex items-center">
                            ⚠️ Cảnh báo
                        </p>
                        <p className="text-amber-700 text-sm mt-1">
                            Các cài đặt này ảnh hưởng đến toàn bộ hệ thống. Vui lòng cẩn thận khi thay đổi.
                        </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                        <div>
                            <p className="font-bold text-red-900">Chế độ bảo trì</p>
                            <p className="text-sm text-red-700">
                                Khi bật, tất cả người dùng sẽ không thể truy cập hệ thống
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings?.maintenance_mode?.value || false}
                                onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-200 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Cấu hình hệ thống</h2>
                    <p className="text-slate-500 mt-1">Quản lý các thiết lập toàn hệ thống</p>
                </div>
                
                <PrimaryButton onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Lưu cấu hình
                        </>
                    )}
                </PrimaryButton>
            </div>

            {message && (
                <div className={`p-4 rounded-xl font-bold ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-700 border-2 border-green-200' 
                        : 'bg-red-50 text-red-700 border-2 border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            <FlatTabs tabs={tabs} />
        </div>
    );
};

export default AdminSettings;
