import { Building2, Phone, Mail, MapPin } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

const MaintenancePage = () => {
    const { config } = useConfig();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Logo/Icon */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-primary rounded-3xl mx-auto mb-6 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">
                        {config?.university_name || 'Đại học Kinh tế - ĐH Đà Nẵng'}
                    </h1>
                    <p className="text-slate-400 text-lg">Hệ thống tuyển sinh trực tuyến</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">
                        🔧 Hệ thống đang bảo trì
                    </h2>
                    <p className="text-slate-300 text-center mb-6">
                        Chúng tôi đang nâng cấp hệ thống để mang đến trải nghiệm tốt hơn cho bạn. 
                        Vui lòng quay lại sau ít phút.
                    </p>
                    
                    <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4 text-center">
                        <p className="text-amber-200 text-sm font-medium">
                            ⏰ Dự kiến hoàn thành: Trong vòng 30 phút
                        </p>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                    <h3 className="text-white font-bold mb-4 text-center">Liên hệ hỗ trợ</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-3 text-slate-300">
                            <Phone className="w-5 h-5 text-primary" />
                            <span>{config?.hotline || '0236 3836 169'}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-3 text-slate-300">
                            <Mail className="w-5 h-5 text-primary" />
                            <span>{config?.email || 'tuyensinh@due.edu.vn'}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-3 text-slate-300">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span className="text-center">{config?.address || '71 Ngũ Hành Sơn, Đà Nẵng'}</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-500 mt-8 text-sm">
                    © 2025 {config?.university_name || 'Đại học Kinh tế - ĐH Đà Nẵng'}. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default MaintenancePage;
