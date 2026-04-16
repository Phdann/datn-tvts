import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator, RotateCcw, AlertCircle, ChevronRight,
  ChevronDown, ArrowRight, ShieldCheck, Plus, Target, Info, CheckCircle, X
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import SidebarBanners from '../components/SidebarBanners';

/* ──────────────── HERO ──────────────── */
function HeroSection() {
  return (
    <section className="relative bg-slate-900 overflow-hidden border-b border-primary/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rotate-45" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-white/5 rotate-12" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="flex items-center gap-2 text-xs text-white/50 mb-8">
          <Link to="/" className="hover:text-white/80 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/80">Tính điểm xét tuyển</span>
        </div>
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-6 uppercase">
            CÔNG CỤ TÍNH ĐIỂM XÉT TUYỂN
          </h1>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl font-medium">
            Hệ hệ thống hỗ trợ thí sinh tra cứu và tính toán điểm xét tuyển chính xác theo quy định của Trường Đại học Kinh tế - Đại học Đà Nẵng.
          </p>
        </div>
      </div>
    </section>
  );
}



/* ──────────────── ACHIEVEMENTS CONFIG ──────────────── */
const ACHIEVEMENTS_15 = [
  "Đường lên đỉnh Olympia",
  "Giải KK HSG Quốc gia, hoặc Nhất/Nhì/Ba HSG Tỉnh/TP",
  "Giải Nhất đến Tư KHKT Quốc gia, hoặc Nhất/Nhì/Ba KHKT Tỉnh/TP",
  "Học sinh Xuất sắc cả 03 năm học THPT",
  "Giải Nhất/Nhì/Ba 'HS, SV với ý tưởng khởi nghiệp' (Bộ GD&ĐT)",
  "Giải Nhất/Nhì/Ba Hội thi Tin học trẻ toàn quốc",
  "Huy chương Vàng/Bạc/Đồng Olympic truyền thống 30/4",
  "Huy chương Vàng/Bạc/Đồng HSG Duyên hải & Đồng bằng Bắc bộ",
  "VĐV Kiện tướng Quốc gia OR Huy chương Quốc gia OR Hội khỏe Phù Đổng",
  "Giải Nhất/Nhì/Ba cuộc thi Startup Runway (DUE)"
];

const ACHIEVEMENTS_10 = [
  "Giải Khuyến khích HSG THPT cấp tỉnh, thành phố",
  "Giải Tư cuộc thi Khoa học, kỹ thuật cấp tỉnh, thành phố",
  "Học sinh Giỏi cả 03 năm học THPT (hoặc kết hợp XS và Giỏi)",
  "Giải Khuyến khích HS, SV với ý tưởng khởi nghiệp (Bộ GD&ĐT)",
  "Giải Khuyến khích Hội thi Tin học trẻ toàn quốc",
  "Giải Khuyến khích cuộc thi Startup Runway (DUE)"
];

/* ──────────────── CONFIG ──────────────── */
const SUBJECT_LABELS = {
  math: 'Toán', physics: 'Lý', chemistry: 'Hóa', biology: 'Sinh',
  literature: 'Văn', history: 'Sử', geography: 'Địa', language: 'N.ngữ', civic: 'GDCD'
};

const COMBINATIONS = [
  { code: 'A00', subjects: ['math', 'physics', 'chemistry'], label: 'A00: Toán, Lý, Hóa' },
  { code: 'A01', subjects: ['math', 'physics', 'language'], label: 'A01: Toán, Lý, Anh' },
  { code: 'D01', subjects: ['math', 'literature', 'language'], label: 'D01: Toán, Văn, Anh' },
  { code: 'D07', subjects: ['math', 'chemistry', 'language'], label: 'D07: Toán, Hóa, Anh' },
  { code: 'D90', subjects: ['math', 'language', 'biology'], label: 'D90: Toán, Anh, Sinh' },
  { code: 'D96', subjects: ['math', 'language', 'geography'], label: 'D96: Toán, Anh, Địa' },
  { code: 'C04', subjects: ['math', 'literature', 'geography'], label: 'C04: Toán, Văn, Địa' },
];

const INPUT_METHODS = [
  { id: '3_sems', label: 'Lớp 10, Lớp 11, HK1 lớp 12', columns: ['grade10', 'grade11', 'grade12_h1'] },
  { id: '12_full', label: 'Cả năm học Lớp 12', columns: ['grade12_full'] },
  { id: '12_sems', label: 'Học kỳ 1, 2 Lớp 12', columns: ['grade12_h1', 'grade12_h2'] },
];

const COLUMN_TITLES = {
  grade10: 'Lớp 10',
  grade11: 'Lớp 11',
  grade12_h1: 'HK1 Lớp 12',
  grade12_h2: 'HK2 Lớp 12',
  grade12_full: 'Cả năm Lớp 12'
};

const createEmptyScores = () => ({
  math: '', physics: '', chemistry: '', biology: '',
  literature: '', history: '', geography: '', language: '', civic: ''
});

/* ──────────────── CONVERSION TABLE MODAL ──────────────── */
function CertConversionModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Bảng Quy đổi Chứng chỉ Ngoại ngữ</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-[11px] border-collapse border border-slate-200">
            <thead>
              <tr className="bg-[#2563eb] text-white font-bold uppercase tracking-wider">
                <th className="border border-white/20 p-3" rowSpan={2}>KNLNN VN</th>
                <th className="border border-white/20 p-3" rowSpan={2}>IELTS ACADEMIC</th>
                <th className="border border-white/20 p-3" rowSpan={2}>TOEFL IBT (*)</th>
                <th className="border border-white/20 p-3" rowSpan={2}>TOEFL ITP</th>
                <th className="border border-white/20 p-3 text-center" colSpan={4}>TOEIC</th>
                <th className="border border-white/20 p-3" rowSpan={2}>VSTEP</th>
              </tr>
              <tr className="bg-[#2563eb]/90 text-white font-bold text-[9px] tracking-widest">
                <th className="border border-white/20 p-2">NGHE</th>
                <th className="border border-white/20 p-2">ĐỌC</th>
                <th className="border border-white/20 p-2">NÓI</th>
                <th className="border border-white/20 p-2">VIẾT</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              <tr className="bg-orange-50/50">
                <td className="border border-slate-200 p-3 font-bold bg-[#2563eb] text-white text-center">Bậc 3</td>
                <td className="border border-slate-200 p-3 text-center">4,0-5,0</td>
                <td className="border border-slate-200 p-3 text-center">30-45</td>
                <td className="border border-slate-200 p-3 text-center">450-499</td>
                <td className="border border-slate-200 p-3 text-center">275-395</td>
                <td className="border border-slate-200 p-3 text-center">275-380</td>
                <td className="border border-slate-200 p-3 text-center">120-150</td>
                <td className="border border-slate-200 p-3 text-center">120-140</td>
                <td className="border border-slate-200 p-3 text-center">4,0-5,5</td>
              </tr>
              <tr>
                <td className="border border-slate-200 p-3 font-bold bg-[#2563eb] text-white text-center">Bậc 4</td>
                <td className="border border-slate-200 p-3 text-center">5,5-6,5</td>
                <td className="border border-slate-200 p-3 text-center">46-93</td>
                <td className="border border-slate-200 p-3 text-center">500-626</td>
                <td className="border border-slate-200 p-3 text-center">400-485</td>
                <td className="border border-slate-200 p-3 text-center">385-450</td>
                <td className="border border-slate-200 p-3 text-center">160-170</td>
                <td className="border border-slate-200 p-3 text-center">150-170</td>
                <td className="border border-slate-200 p-3 text-center">6,0-8,0</td>
              </tr>
              <tr className="bg-orange-50/50">
                <td className="border border-slate-200 p-3 font-bold bg-[#2563eb] text-white text-center">Từ Bậc 5</td>
                <td className="border border-slate-200 p-3 text-center">≥ 7,0</td>
                <td className="border border-slate-200 p-3 text-center">≥ 94</td>
                <td className="border border-slate-200 p-3 text-center">≥ 627</td>
                <td className="border border-slate-200 p-3 text-center">≥ 490</td>
                <td className="border border-slate-200 p-3 text-center">≥ 455</td>
                <td className="border border-slate-200 p-3 text-center">≥ 180</td>
                <td className="border border-slate-200 p-3 text-center">≥ 180</td>
                <td className="border border-slate-200 p-3 text-center">≥ 8,5</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-[10px] text-slate-400 italic">
            * Không chấp nhận phiên bản Home Edition. Các chứng chỉ tiếng Anh trong thời hạn 2 năm, tính đến ngày nộp hồ sơ ĐKXT.
          </p>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── MAIN PAGE ──────────────── */
export default function ScoreCalculatorPage() {
  const [showCertModal, setShowCertModal] = useState(false);
  const [method, setMethod] = useState('3_sems');
  const [activeCombo, setActiveCombo] = useState('A00');
  const [scores, setScores] = useState({
    grade10: createEmptyScores(),
    grade11: createEmptyScores(),
    grade12_h1: createEmptyScores(),
    grade12_h2: createEmptyScores(),
    grade12_full: createEmptyScores(),
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [region, setRegion] = useState('kv3');
  const [priorityObj, setPriorityObj] = useState('none');

  const [isDirectEligible, setIsDirectEligible] = useState(false);
  const [selected15, setSelected15] = useState([]);
  const [selected10, setSelected10] = useState([]);
  const [trainingType, setTrainingType] = useState('Tiêu chuẩn');
  const [englishCert, setEnglishCert] = useState('none');
  const [itCert, setItCert] = useState('none');
  const [satCert, setSatCert] = useState('none');
  const [actCert, setActCert] = useState('none');

  const currentMethod = INPUT_METHODS.find(m => m.id === method);

  const getSubjectAvg = (subjectKey) => {
    const relevantCols = currentMethod.columns;
    const vals = relevantCols.map(col => parseFloat(scores[col][subjectKey]) || 0);
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = sum / relevantCols.length;
    return parseFloat(avg.toFixed(2));
  };

  const combination = COMBINATIONS.find(c => c.code === activeCombo);
  const subjectAverages = combination.subjects.map(s => getSubjectAvg(s));
  const subjectTotal = subjectAverages.reduce((a, b) => a + b, 0);

  // 1. Admission Priority Points (KV & ĐT) - MOET 2023 Rule
  const getPriorityPoints = () => {
    let base = 0;
    // Region
    if (region === 'kv1') base += 0.75;
    else if (region === 'kv2nt') base += 0.5;
    else if (region === 'kv2') base += 0.25;
    // Object
    if (priorityObj === 'ut1') base += 2.0;
    else if (priorityObj === 'ut2') base += 1.0;

    // MOET 2023 Rule: Reduction for scores >= 22.5
    if (subjectTotal >= 22.5) {
      return base * (30 - subjectTotal) / 7.5;
    }
    return base;
  };

  const priorityPoints = getPriorityPoints();

  // 2. Academic Bonus Points (Khuyến khích/Thưởng)
  const calcAcademicBonus = () => {
    const pointsBonus = isDirectEligible ? 3.0 : 0;

    // Sum all selected achievements (1.5 for ACHIEVEMENTS_15, 1.0 for ACHIEVEMENTS_10)
    const rawAward = (selected15.length * 1.5) + (selected10.length * 1.0);
    // DUE Rule: Total Award (Xét thưởng) capped at 1.5
    const pointsAward = Math.min(rawAward, 1.5);

    let pointsIncentive = 0;
    const incentiveValues = [];
    if (itCert !== 'none') incentiveValues.push(1.5);
    if (satCert === '1100') incentiveValues.push(1.0);
    else if (satCert === '1300') incentiveValues.push(1.5);
    if (actCert === '22') incentiveValues.push(1.0);
    else if (actCert === '28') incentiveValues.push(1.5);
    if (trainingType !== 'Tiêu chuẩn') {
      if (englishCert === 'bac3') incentiveValues.push(1.0);
      else if (englishCert === 'bac4') incentiveValues.push(1.5);
    }
    if (incentiveValues.length > 0) pointsIncentive = Math.max(...incentiveValues);

    // DUE formula: Điểm cộng = Điểm thưởng + Điểm xét thưởng + Điểm khuyến khích
    const rawTotalBonus = pointsBonus + pointsAward + pointsIncentive;
    // Cap total bonus points at 3.0
    const finalAcademicBonus = Math.min(rawTotalBonus, 3.0);
    return { pointsBonus, pointsAward, pointsIncentive, finalAcademicBonus };
  };

  const { pointsBonus, pointsAward, pointsIncentive, finalAcademicBonus } = calcAcademicBonus();

  // Final Total Score
  const total = subjectTotal + priorityPoints + finalAcademicBonus;

  const reset = () => {
    setScores({
      grade10: createEmptyScores(),
      grade11: createEmptyScores(),
      grade12_h1: createEmptyScores(),
      grade12_h2: createEmptyScores(),
      grade12_full: createEmptyScores(),
    });
    setErrors({});
    setRegion('kv3');
    setPriorityObj('none');
    setIsDirectEligible(false);
    setSelected15([]);
    setSelected10([]);
    setTrainingType('Tiêu chuẩn');
    setEnglishCert('none');
    setItCert('none');
    setSatCert('none');
    setActCert('none');
  };

  const handleScoreChange = (period, subject, val) => {
    let finalVal = val;
    if (val !== '') {
      const numVal = parseFloat(val);
      if (numVal < 0) finalVal = '0';
      if (numVal > 10) finalVal = '10';
    }

    setScores(prev => ({
      ...prev,
      [period]: { ...prev[period], [subject]: finalVal }
    }));
  };

  const toggle15 = (item) => setSelected15(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  const toggle10 = (item) => setSelected10(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);

  const inputCls = "w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold text-slate-700 bg-white";

  return (
    <div className="relative pb-24 bg-slate-50/50">
      <HeroSection />

      <section className="max-w-7xl mx-auto px-4 py-12 text-left">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left — Calculator form */}
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="py-20 flex justify-center"><LoadingSpinner /></div>
            ) : (
              <>
                <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />

                  {/* Method & Combination Selection */}
                  <div className="grid sm:grid-cols-2 gap-8 mb-10 pb-10 border-b border-slate-100">
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Calculator className="w-3.5 h-3.5 text-primary" /> 1. Chọn phương án nhập điểm
                      </label>
                      <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className={inputCls}
                      >
                        {INPUT_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-blue-600" /> 2. Chọn tổ hợp xét tuyển
                      </label>
                      <select
                        value={activeCombo}
                        onChange={(e) => setActiveCombo(e.target.value)}
                        className={inputCls}
                      >
                        {COMBINATIONS.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Score Input Grid */}
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-6 text-slate-800">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider">3. Nhập điểm học tập</h3>
                    </div>

                    <div className={`grid gap-8 overflow-x-auto pb-4 ${currentMethod.columns.length === 3 ? 'grid-cols-3 min-w-[650px]' :
                        currentMethod.columns.length === 2 ? 'grid-cols-2 min-w-[450px]' : 'grid-cols-1'
                      }`}>
                      {currentMethod.columns.map(colKey => (
                        <div key={colKey} className="bg-slate-50/50 p-5 rounded-lg border border-slate-100 flex flex-col gap-3">
                          <div className="text-slate-900 pb-3 border-b border-white text-center font-bold text-[11px] uppercase tracking-widest leading-none">
                            {COLUMN_TITLES[colKey]}
                          </div>
                          {Object.entries(SUBJECT_LABELS).map(([subKey, label]) => (
                            <div key={subKey} className="flex items-center justify-between gap-4">
                              <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                placeholder="0.0"
                                value={scores[colKey][subKey]}
                                onChange={(e) => handleScoreChange(colKey, subKey, e.target.value)}
                                className="w-20 bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-center focus:outline-none focus:border-primary font-bold text-slate-900 transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. BONUS POINTS SECTION */}
                  <div className="border-t border-slate-100 pt-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-lg shadow-sm">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">4. Thông tin điểm ưu tiên & cộng</h2>
                        <p className="text-[11px] text-slate-400 font-medium">Cập nhật chế độ ưu tiên và chứng chỉ ngoại ngữ, tin học</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
                      <div className="flex items-center gap-2 text-slate-700 mb-6">
                        <Info className="w-4 h-4 shrink-0 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Chế độ ưu tiên (Khu vực & Đối tượng)</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Khu vực tuyển sinh</label>
                          <select value={region} onChange={e => setRegion(e.target.value)} className={inputCls}>
                            <option value="kv3">Khu vực 3 (Không cộng điểm)</option>
                            <option value="kv2">Khu vực 2 (+0.25 điểm)</option>
                            <option value="kv2nt">Khu vực 2-NT (+0.5 điểm)</option>
                            <option value="kv1">Khu vực 1 (+0.75 điểm)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Đối tượng ưu tiên</label>
                          <select value={priorityObj} onChange={e => setPriorityObj(e.target.value)} className={inputCls}>
                            <option value="none">Không thuộc đối tượng ưu tiên</option>
                            <option value="ut2">Nhóm UT2 (ĐT 05-07) (+1.0 điểm)</option>
                            <option value="ut1">Nhóm UT1 (ĐT 01-04) (+2.0 điểm)</option>
                          </select>
                        </div>
                      </div>
                      {subjectTotal >= 22.5 && (
                        <p className="mt-4 text-[10px] text-blue-700 font-bold">
                          * Hệ thống đang áp dụng quy tắc giảm điểm ưu tiên cho tổng điểm ≥ 22.5 theo quy định của Bộ GD&ĐT.
                        </p>
                      )}
                    </div>

                    {/* Điểm Thưởng */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Điểm Thưởng <span className="text-slate-400 font-medium normal-case">(Tối đa 3.0)</span></h4>
                        <span className="text-sm font-bold text-primary">{pointsBonus.toFixed(2)}</span>
                      </div>
                      <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
                        <input
                          type="checkbox"
                          checked={isDirectEligible}
                          onChange={e => setIsDirectEligible(e.target.checked)}
                          className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm font-semibold text-slate-700">Đủ điều kiện Xét tuyển thẳng Phương thức 1 nhưng không dùng (+3.0 điểm)</span>
                      </label>
                    </div>

                    {/* Điểm Xét Thưởng */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Điểm Xét Thưởng <span className="text-slate-400 font-medium normal-case">(Tối đa 1.5)</span></h4>
                        <span className="text-sm font-bold text-primary">{pointsAward.toFixed(2)}</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">CỘNG 1.5 ĐIỂM / THÀNH TÍCH</p>
                          {ACHIEVEMENTS_15.map(a => (
                            <label key={a} className="flex items-start gap-2.5 p-3 bg-white border border-slate-100 rounded-lg cursor-pointer hover:border-primary/20 transition-all">
                              <input type="checkbox" checked={selected15.includes(a)} onChange={() => toggle15(a)} className="mt-0.5 w-3.5 h-3.5 text-primary rounded" />
                              <span className="text-[11px] font-semibold text-slate-600 leading-tight">{a}</span>
                            </label>
                          ))}
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">CỘNG 1.0 ĐIỂM / THÀNH TÍCH</p>
                          {ACHIEVEMENTS_10.map(a => (
                            <label key={a} className="flex items-start gap-2.5 p-3 bg-white border border-slate-100 rounded-lg cursor-pointer hover:border-primary/20 transition-all">
                              <input type="checkbox" checked={selected10.includes(a)} onChange={() => toggle10(a)} className="mt-0.5 w-3.5 h-3.5 text-primary rounded" />
                              <span className="text-[11px] font-semibold text-slate-600 leading-tight">{a}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Điểm Khuyến Khích */}
                    <div className="mb-8 border-t border-slate-100 pt-8">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Điểm Khuyến Khích <span className="text-slate-400 font-medium normal-case">(Tối đa 1.5)</span></h4>
                        <span className="text-sm font-bold text-primary">{pointsIncentive.toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Loại hình đào tạo</label>
                          <select value={trainingType} onChange={e => setTrainingType(e.target.value)} className={inputCls}>
                            <option value="Tiêu chuẩn">Tiêu chuẩn</option>
                            <option value="Toàn phần tiếng Anh">Toàn phần tiếng Anh (IBS ELITE)</option>
                            <option value="Bán phần tiếng Anh">Bán phần tiếng Anh</option>
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                            Chứng chỉ Ngoại ngữ
                            <button onClick={() => setShowCertModal(true)} type="button" className="text-primary hover:underline flex items-center gap-0.5"><RotateCcw className="w-2.5 h-2.5" /> Quy đổi</button>
                          </label>
                          <select value={englishCert} onChange={e => setEnglishCert(e.target.value)} className={inputCls}>
                            <option value="none">Không có</option>
                            <option value="bac3">Bậc 3 (IELTS 5.0 - 5.5) (+1.0 điểm)</option>
                            <option value="bac4">Bậc 4 trở lên (IELTS 6.0+) (+1.5 điểm)</option>
                          </select>
                          {trainingType === 'Tiêu chuẩn' && (
                            <p className="text-[10px] text-red-500 font-bold mt-2">* Không cộng điểm ngoại ngữ cho hệ Tiêu chuẩn</p>
                          )}
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Chứng chỉ Tin học</label>
                            <select value={itCert} onChange={e => setItCert(e.target.value)} className={inputCls}>
                              <option value="none">Không có</option>
                              <option value="mos">MOS (+1.5 điểm)</option>
                              <option value="ic3">IC3 (+1.5 điểm)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Chứng chỉ SAT</label>
                            <select value={satCert} onChange={e => setSatCert(e.target.value)} className={inputCls}>
                              <option value="none">Không có</option>
                              <option value="1100">1100 ≤ SAT &lt; 1300 (+1.0 điểm)</option>
                              <option value="1300">SAT ≥ 1300 (+1.5 điểm)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Chứng chỉ ACT</label>
                            <select value={actCert} onChange={e => setActCert(e.target.value)} className={inputCls}>
                              <option value="none">Không có</option>
                              <option value="22">22 ≤ ACT &lt; 28 (+1.0 điểm)</option>
                              <option value="28">ACT ≥ 28 (+1.5 điểm)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 border-t border-slate-100 pt-10 mt-6">
                    <button
                      onClick={reset}
                      className="flex-1 bg-slate-900 text-white text-xs font-bold py-4 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-[0.98]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Làm mới dữ liệu
                    </button>
                    <Link
                      to="/tra-cuu-diem-chuan"
                      className="flex-1 bg-white border border-slate-200 text-slate-900 text-xs font-bold py-4 rounded-lg hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-[0.98]"
                    >
                      Tra cứu điểm chuẩn <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right sidebar — Info */}
          <div className="lg:col-span-2 space-y-8 sticky top-24 self-start z-10">
            {/* Formula Info Box */}
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              <p className="text-[11px] font-black text-orange-700 uppercase tracking-tighter leading-tight">
                CÁCH TÍNH: Điểm cộng = Điểm thưởng + Điểm xét thưởng + Điểm khuyến khích (Tối đa 3.0 điểm)
              </p>
            </div>

            {/* Dynamic Summary Panel */}
            <div className="bg-slate-900 text-white rounded-xl overflow-hidden shadow-xl">
              <div className="p-8 border-b border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white/40 mb-6">BÁO CÁO KẾT QUẢ TÍNH ĐIỂM</h3>
                <div className="space-y-4">
                  {combination.subjects.map((s, i) => (
                    <div key={s} className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">{SUBJECT_LABELS[s]}</span>
                      <span className="text-xl font-bold font-mono">{subjectAverages[i].toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-4 space-y-3 font-semibold">
                    <div className="flex justify-between items-center text-emerald-400">
                      <span className="text-[10px] uppercase tracking-wider">Ưu tiên (KV/ĐT)</span>
                      <span className="text-lg font-bold">+{priorityPoints.toFixed(3)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-blue-400">
                        <span className="text-[10px] uppercase tracking-wider">Điểm cộng</span>
                        <span className="text-lg font-bold">+{finalAcademicBonus.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 pl-2 border-l border-white/10 ml-1">
                        {pointsBonus > 0 && <span className="text-[8px] text-white/30 uppercase tracking-tight">Thưởng: +{pointsBonus.toFixed(1)}</span>}
                        {pointsAward > 0 && <span className="text-[8px] text-white/30 uppercase tracking-tight">Xét thưởng: +{pointsAward.toFixed(1)}</span>}
                        {pointsIncentive > 0 && <span className="text-[8px] text-white/30 uppercase tracking-tight">Khuyến khích: +{pointsIncentive.toFixed(1)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="pt-8 border-t border-white/10">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">TỔNG ĐIỂM DỰ KIẾN</p>
                        <p className="text-[11px] text-primary-light font-semibold uppercase">{activeCombo} Group</p>
                      </div>
                      <div className="text-right">
                        <span className="text-5xl font-black text-white tracking-tighter leading-none">{total.toFixed(2)}</span>
                        <span className="text-sm font-bold text-white/20 ml-2">/ 33.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white/5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center shrink-0"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /></div>
                  <p className="text-[11px] text-white/50 leading-relaxed">Dữ liệu được tính toán dựa trên quy chế tuyển sinh hiện hành của Đại học Đà Nẵng.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center shrink-0"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /></div>
                  <p className="text-[11px] text-white/50 leading-relaxed">Mọi kết quả chỉ mang tính chất tham khảo cho đến khi có thông báo chính thức.</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest leading-none">Liên kết hữu ích</h3>
              </div>
              <div className="space-y-3">
                <Link to="/tra-cuu-diem-chuan" className="flex items-center justify-between p-4 bg-slate-50 border border-transparent rounded-lg hover:border-primary/20 hover:bg-white transition-all group">
                  <span className="text-sm font-semibold text-slate-700">Tra cứu điểm chuẩn</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all" />
                </Link>
                <Link to="/hoc-bong-chinh-sach" className="flex items-center justify-between p-4 bg-slate-50 border border-transparent rounded-lg hover:border-primary/20 hover:bg-white transition-all group">
                  <span className="text-sm font-semibold text-slate-700">Học bổng & Miễn giảm học phí</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all" />
                </Link>
                <Link to="/nganh-dao-tao" className="flex items-center justify-between p-4 bg-slate-50 border border-transparent rounded-lg hover:border-primary/20 hover:bg-white transition-all group">
                  <span className="text-sm font-semibold text-slate-700">Đề án tuyển sinh</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 inset-x-0 bg-slate-900 text-white p-5 shadow-2xl z-40 md:hidden flex items-center justify-between border-t border-white/10">
        <div>
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Tổng điểm dự kiến</p>
          <p className="text-3xl font-black leading-none tracking-tighter">{total.toFixed(2)}</p>
        </div>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-white text-slate-900 rounded-lg font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg"
        >
          Làm mới
        </button>
      </div>


      <CertConversionModal isOpen={showCertModal} onClose={() => setShowCertModal(false)} />
    </div>
  );
}
