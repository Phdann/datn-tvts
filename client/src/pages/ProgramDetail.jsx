import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Share2, Printer } from 'lucide-react';

const ProgramDetail = () => {
    const { type } = useParams();

    const programData = {
        'chinh-quy': {
            title: 'CHƯƠNG TRÌNH CỬ NHÂN CHÍNH QUY',
            description: 'Chương trình đào tạo cử nhân chính quy được xây dựng tuân thủ theo các quy định của Bộ Giáo dục và Đào tạo (GD&ĐT) dành cho hệ thống đào tạo tín chỉ. Sinh viên sau khi hoàn thành chương trình đào tạo và có đủ điều kiện tốt nghiệp sẽ được Trường Đại học Kinh tế - Đại học Đà Nẵng xét công nhận tốt nghiệp, cấp văn bằng và phụ lục văn bằng theo quy định.',
            accentColor: 'border-primary'
        },
        'lien-ket': {
            title: 'CHƯƠNG TRÌNH LIÊN KẾT QUỐC TẾ',
            description: 'Chương trình liên kết đào tạo với các đối tác uy tín nước ngoài, mang lại môi trường học tập quốc tế và bằng cấp từ các trường đại học hàng đầu thế giới.',
            accentColor: 'border-green-600'
        },
        'vua-lam-vua-hoc': {
            title: 'HỆ VỪA LÀM VỪA HỌC',
            description: 'Hình thức đào tạo linh hoạt phù hợp cho người đang đi làm muốn nâng cao trình độ chuyên môn và nghiệp vụ.',
            accentColor: 'border-indigo-600'
        }
    };

    const current = programData[type] || programData['chinh-quy'];

    const sideMenu = [
        "Phương thức xét tuyển",
        "Kê khai thông tin xét tuyển",
        "Chỉ tiêu tuyển sinh",
        "Chương trình liên kết quốc tế",
        "Chuyên ngành đào tạo",
        "Học bổng và chế độ chính sách",
        "Tính kết quả học tập"
    ];

    const topSubMenu = [
        "CỔNG THÔNG TIN TUYỂN SINH",
        "GIỚI THIỆU VỀ KHOA",
        "DÀNH CHO SINH VIÊN",
        "GÓC CHIA SẺ",
        "GIẢI ĐÁP - TƯ VẤN"
    ];

    return (
        <div className="w-full bg-white min-h-screen">
            {/* Header Section - STRICK FLAT */}
            <div className={`bg-gray-100 border-b-8 ${current.accentColor} py-20`}>
                <div className="container mx-auto px-4 max-w-5xl">
                    <h1 className="text-gray-950 font-black text-5xl lg:text-7xl mb-8 uppercase tracking-tighter leading-none">
                        {current.title}
                    </h1>
                    <p className="text-gray-600 text-lg lg:text-xl leading-relaxed max-w-3xl font-bold border-l-8 border-gray-300 pl-8 capitalize">
                        {current.description}
                    </p>
                </div>
            </div>

            {/* Sub-Menu Bar - FLAT */}
            <div className="bg-gray-950 text-white">
                <div className="container mx-auto px-4 py-5 flex flex-wrap justify-between items-center text-xs font-black gap-6 uppercase tracking-widest">
                    {topSubMenu.map((item, idx) => (
                        <span key={idx} className="cursor-pointer hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">{item}</span>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 flex flex-col lg:flex-row gap-16 max-w-7xl">
            
                <aside className="lg:w-1/4">
                    <div className="bg-white border-4 border-gray-900 shadow-none">
                        <div className="bg-gray-900 text-white p-4">
                            <h3 className="text-sm font-black uppercase tracking-widest">Danh mục</h3>
                        </div>
                        {sideMenu.map((item, idx) => (
                            <button key={idx} className="w-full flex items-center justify-between p-5 border-b-4 border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group">
                                <span className={`text-base font-black uppercase tracking-tight ${idx === 0 ? 'text-primary' : 'text-gray-700'}`}>{item}</span>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="lg:w-3/4 space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-gray-900 pb-6 gap-4">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                            PHƯƠNG THỨC XÉT TUYỂN 2025
                        </h2>
                        <div className="flex items-center space-x-2">
                            <button className="bg-blue-600 text-white px-4 py-2 text-xs font-black uppercase tracking-widest">Thích 278</button>
                            <button className="bg-blue-800 text-white px-4 py-2 text-xs font-black uppercase tracking-widest">Chia sẻ</button>
                        </div>
                    </div>

                    <div className="space-y-8 text-gray-800 leading-relaxed">
                        <div className="bg-red-600 text-white p-6 border-b-8 border-red-800">
                           <p className="font-black text-lg uppercase tracking-widest flex items-center gap-3">
                               <span>⚠️ Click nhấn vào đây để xem đầy đủ</span>
                               <span className="underline decoration-4">THÔNG TIN TUYỂN SINH 2025</span>
                           </p>
                        </div>

                        <div className="relative py-12 border-y-2 border-gray-100">
                            <h4 className="text-4xl md:text-6xl font-black text-gray-950 uppercase tracking-tighter flex flex-col leading-none">
                                <span>PHƯƠNG THỨC</span>
                                <span className="text-primary text-6xl md:text-9xl">XÉT TUYỂN 2025</span>
                            </h4>
                        </div>
                        
                        <div className="bg-gray-50 p-16 border-4 border-dashed border-gray-200 text-center">
                            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xl">
                                [ Nội dung chi tiết phương thức xét tuyển ]
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-12 border-t-2 border-gray-100">
                        <button className="p-4 bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors border-2 border-gray-200"><Printer className="w-6 h-6" /></button>
                        <button className="p-4 bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors border-2 border-gray-200"><Share2 className="w-6 h-6" /></button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProgramDetail;
