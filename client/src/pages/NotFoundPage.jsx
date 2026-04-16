import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-black text-slate-200 leading-none mb-2 tracking-tighter">
            404
          </h1>
        </div>

        

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
            Trang không tìm thấy
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Rất tiếc, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Có thể URL không chính xác hoặc trang đã được xóa.
          </p>
        </div>

        {/* Suggestions */}
        <div className="mb-8 text-left bg-white rounded-xl p-6 border border-slate-200">
          <p className="text-sm font-semibold text-slate-900 mb-3">Bạn có thể thử:</p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>✓ Kiểm tra lại URL</li>
            <li>✓ Quay về trang chủ</li>
            <li>✓ Sử dụng thanh tìm kiếm</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-dark transition-colors duration-200"
          >
            <Home className="w-5 h-5" />
            Trang chủ
          </Link>

          
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang trước
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Nếu bạn cho rằng đây là lỗi, vui lòng{' '}
            <Link to="/lien-he" className="text-primary hover:underline font-semibold">
              liên hệ với chúng tôi
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
