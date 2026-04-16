import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-3">Bảo trì hệ thống</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Hệ thống đang được bảo trì để nâng cấp và cải thiện chất lượng dịch vụ. Vui lòng quay lại sau.
        </p>
        <p className="text-xs text-slate-400">
          Liên hệ hỗ trợ: <a href="mailto:support@ute.udn.vn" className="text-primary hover:underline">support@ute.udn.vn</a>
        </p>
      </div>
    </div>
  );
}
