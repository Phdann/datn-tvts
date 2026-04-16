import { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const faqData = [
  {
    category: 'Tuyển sinh',
    items: [
      { q: 'Trường có những phương thức xét tuyển nào?', a: 'Trường áp dụng nhiều phương thức xét tuyển bao gồm: xét điểm thi THPT Quốc gia, xét học bạ THPT, xét tuyển thẳng, và xét tuyển kết hợp. Thí sinh có thể chọn một hoặc nhiều phương thức phù hợp.' },
      { q: 'Thời gian đăng ký xét tuyển?', a: 'Thời gian đăng ký xét tuyển thường bắt đầu từ tháng 4 đến tháng 8 hàng năm. Thí sinh nên theo dõi thông báo chính thức trên website và trang Fanpage của trường để cập nhật thời gian cụ thể.' },
      { q: 'Hồ sơ xét tuyển cần những gì?', a: 'Hồ sơ bao gồm: Phiếu đăng ký xét tuyển, bản sao công chứng bằng tốt nghiệp THPT, bản sao công chứng học bạ, CMND/CCCD, ảnh 3x4, và các giấy tờ ưu tiên (nếu có).' },
    ]
  },
  {
    category: 'Học phí & Chính sách',
    items: [
      { q: 'Học phí của trường bao nhiêu?', a: 'Học phí dao động từ 15 đến 25 triệu đồng/năm tùy theo ngành học. Mức học phí cụ thể được công bố hàng năm theo quy định.' },
      { q: 'Trường có chính sách học bổng không?', a: 'Trường có nhiều loại học bổng: học bổng khuyến khích học tập, học bổng tài trợ, học bổng cho sinh viên có hoàn cảnh khó khăn. Mức học bổng từ một phần đến toàn phần học phí.' },
      { q: 'Sinh viên có được hỗ trợ ký túc xá không?', a: 'Trường có hệ thống ký túc xá với đầy đủ tiện nghi phục vụ sinh viên. Sinh viên năm nhất và sinh viên có hoàn cảnh khó khăn được ưu tiên.' },
    ]
  },
  {
    category: 'Đào tạo & Chương trình',
    items: [
      { q: 'Có chương trình liên kết quốc tế không?', a: 'Trường có nhiều chương trình liên kết đào tạo với các đại học uy tín tại Nhật Bản, Hàn Quốc, Đức, và Đài Loan bao gồm trao đổi sinh viên và chuyển tiếp.' },
      { q: 'Chương trình đào tạo kéo dài bao lâu?', a: 'Chương trình đại học chính quy kéo dài 4 năm (8 học kỳ). Một số ngành kỹ thuật có thể kéo dài 4.5-5 năm. Chương trình sau đại học từ 1.5-3 năm tùy bậc học.' },
    ]
  },
  {
    category: 'Công nghệ & Hỗ trợ',
    items: [
      { q: 'Tư vấn viên AI hoạt động như thế nào?', a: 'Tư vấn viên AI sử dụng trí tuệ nhân tạo để trả lời các câu hỏi về tuyển sinh, chương trình đào tạo, và thông tin trường. Bạn có thể trò chuyện trực tiếp qua trang Tư vấn trực tuyến.' },
      { q: 'Tính năng dự đoán trúng tuyển hoạt động ra sao?', a: 'Dựa trên dữ liệu điểm chuẩn các năm trước, hệ thống phân tích và dự đoán khả năng trúng tuyển của bạn vào ngành mong muốn. Kết quả mang tính tham khảo.' },
    ]
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggle = (key) => setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));

  const filtered = faqData.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div>
      <PageHeader
        title="Câu hỏi thường gặp"
        subtitle="Giải đáp thắc mắc về tuyển sinh và đào tạo"
        breadcrumbs={[{ label: 'Hỏi đáp FAQ' }]}
      />

      <section className="max-w-3xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="flex mb-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* FAQ categories */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Không tìm thấy câu hỏi phù hợp.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map((cat) => (
              <div key={cat.category}>
                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary inline-block"></span>
                  {cat.category}
                </h2>
                <div className="space-y-1">
                  {cat.items.map((item, i) => {
                    const key = `${cat.category}-${i}`;
                    const isOpen = openItems[key];
                    return (
                      <div key={key} className="bg-white border border-slate-100 rounded-xl">
                        <button
                          onClick={() => toggle(key)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-sm font-semibold text-slate-700 pr-4">{item.q}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
