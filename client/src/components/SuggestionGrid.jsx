import { Sparkles } from 'lucide-react';

function SuggestionGrid({ suggestions, onSelect, persona }) {
  const defaultSuggestions = {
    student: [
      '🎯 Ngành nào lương cao nhất?',
      '📊 Tra điểm chuẩn năm 2024',
      '🎓 Tôi được 24 điểm khối A00, nên chọn ngành gì?',
      '💼 Ngành CNTT có cơ hội việc làm không?',
      '🏫 Đời sống sinh viên ở trường như thế nào?',
      '💰 Học bổng có những loại nào?'
    ],
    parent: [
      '💵 Chi phí học tập cho 4 năm là bao nhiêu?',
      '🎯 Tỷ lệ sinh viên có việc làm sau tốt nghiệp?',
      '🏢 Cơ sở vật chất và an ninh trường học?',
      '📈 Ngành nào có triển vọng tương lai tốt?',
      '🤝 Chương trình liên kết quốc tế có gì?',
      '📋 Thủ tục nhập học cần chuẩn bị gì?'
    ]
  };

  const displaySuggestions = suggestions || defaultSuggestions[persona];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12 bg-primary p-12 border-b-8 border-primary-dark">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white border-4 border-white mb-6">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 uppercase tracking-tighter">
          Xin chào! Tôi có thể giúp gì cho bạn?
        </h2>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
          {persona === 'student' 
            ? 'Hỏi tôi bất cứ điều gì về tuyển sinh, ngành học, điểm chuẩn...'
            : 'Tôi sẽ tư vấn chi tiết về học phí, cơ hội việc làm, chương trình đào tạo...'
          }
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 px-4">
        {displaySuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="group p-6 bg-white border-2 border-gray-200 hover:border-primary transition-colors text-left"
          >
            <p className="text-base font-bold text-gray-800 group-hover:text-primary transition-colors">
              {suggestion}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-12 text-center pb-8 border-b-2 border-gray-100 mx-4">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          💡 Gợi ý: Bạn có thể hỏi về điểm chuẩn, học phí, ngành học, cơ hội việc làm...
        </p>
      </div>
    </div>
  );
}

export default SuggestionGrid;
