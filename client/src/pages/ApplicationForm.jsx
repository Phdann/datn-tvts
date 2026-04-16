import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Upload, CheckCircle, AlertCircle, User, Mail, Phone,
  GraduationCap, ChevronRight, ArrowRight, ArrowLeft, Award,
  BookOpen, ChevronDown, ShieldCheck, Hash, Clock, Info,
  Building2, Sparkles, Send, Loader2, XCircle, BarChart3, Target,
} from 'lucide-react';
import { applicationService, majorService } from '../services';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

/* ──────────────── HERO ──────────────── */
function HeroSection() {
  return (
    <section className="relative bg-primary-dark overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rotate-45" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-primary-light/10 rotate-12" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-14 lg:py-20">
        <div className="flex items-center gap-2 text-xs text-white/50 mb-8">
          <Link to="/" className="hover:text-white/80 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/80">Đăng ký xét tuyển</span>
        </div>
        <div className="max-w-3xl">
          <span className="inline-block bg-white/10 text-white/90 text-[10px] font-bold px-3 py-1 mb-4 uppercase tracking-widest border border-white/10">
            Xét tuyển trực tuyến
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-5">
            Đăng ký
            <br />
            <span className="text-primary-light">Xét tuyển đại học</span>
          </h1>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl">
            Nộp hồ sơ xét tuyển trực tuyến nhanh chóng, an toàn. Hệ thống tiếp nhận 24/7
            với quy trình đơn giản, minh bạch.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── STEP INDICATOR ──────────────── */
function StepIndicator({ step }) {
  const steps = [
    { num: 1, label: 'Thông tin cá nhân', icon: User },
    { num: 2, label: 'Chọn ngành & PT', icon: GraduationCap },
    { num: 3, label: 'Xác nhận & Nộp', icon: FileText },
  ];

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = step === s.num;
        const isDone = step > s.num;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 flex items-center justify-center transition-colors ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                  }`}
              >
                {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isDone ? 'text-emerald-600' : isActive ? 'text-primary' : 'text-slate-400'
                }`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 transition-colors ${isDone ? 'bg-emerald-300' : 'bg-slate-200'
                }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────── FORM INPUT ──────────────── */
function FormInput({ label, required, icon: Icon, type = 'text', error, ...props }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          className={`w-full border ${error ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'} px-4 py-3 text-sm placeholder-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors`}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><XCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

/* ──────────────── SUCCESS SCREEN ──────────────── */
function SuccessScreen({ result, onReset }) {
  return (
    <div className="max-w-xl mx-auto animate-fadeIn">
      <div className="bg-white border border-slate-100 overflow-hidden">
        {/* Success header */}
        <div className="bg-emerald-500 px-8 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">Đăng ký thành công!</h2>
          <p className="text-sm text-white/80 mt-1">Hồ sơ của bạn đã được tiếp nhận</p>
        </div>

        <div className="p-8">
          <div className="bg-emerald-50 border border-emerald-200 p-5 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-emerald-700 font-medium">{result.message}</p>
                {result.id && (
                  <p className="text-xs text-emerald-600 mt-2">
                    Mã hồ sơ: <strong className="text-sm">#{result.id}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600 mb-6">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p>Hồ sơ của bạn sẽ được xử lý trong vòng <strong>3-5 ngày làm việc</strong>.</p>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p>Kết quả sẽ được thông báo qua email bạn đã đăng ký.</p>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p>Nếu cần hỗ trợ, liên hệ hotline: <strong className="text-primary">0236 3836 169</strong></p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onReset}
              className="flex-1 bg-primary text-white text-sm font-bold py-3 hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
            >
              Đăng ký hồ sơ khác <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/"
              className="px-5 border border-slate-200 text-slate-600 text-sm font-semibold hover:border-primary transition-colors flex items-center justify-center"
            >
              Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── ERROR SCREEN ──────────────── */
function ErrorScreen({ result, onReset }) {
  return (
    <div className="max-w-xl mx-auto animate-fadeIn">
      <div className="bg-red-50 border border-red-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-red-700 mb-2">Đã xảy ra lỗi</h2>
        <p className="text-sm text-red-600 mb-6">{result.message}</p>
        <button
          onClick={onReset}
          className="bg-red-600 text-white text-sm font-bold px-8 py-3 hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

/* ──────────────── MAIN PAGE ──────────────── */
export default function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [majors, setMajors] = useState([]);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '', high_school_score: '',
    major_id: '', method_id: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [majData, methRes] = await Promise.all([
          majorService.getAllMajors({ limit: 200 }),
          api.get('/admission-methods').catch(() => ({ data: [] })),
        ]);
        setMajors(majData.data || []);
        const md = methRes.data;
        setMethods(Array.isArray(md) ? md : md?.data || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  const update = (k, v) => {
    let finalVal = v;
    if (k === 'high_school_score' && v !== '') {
      const numVal = parseFloat(v);
      if (numVal < 0) finalVal = '0';
      if (numVal > 10) finalVal = '10';
    }
    setForm({ ...form, [k]: finalVal });
  };

  const selectedMajor = useMemo(() => majors.find(m => m.id == form.major_id), [majors, form.major_id]);
  const selectedMethod = useMemo(() => methods.find(m => m.id == form.method_id), [methods, form.method_id]);

  // Grouped majors by faculty
  const groupedMajors = useMemo(() => {
    const groups = {};
    majors.forEach(m => {
      const fName = m.Faculty?.name || 'Khác';
      if (!groups[fName]) groups[fName] = [];
      groups[fName].push(m);
    });
    return groups;
  }, [majors]);

  /* Validation */
  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^(0|\+84)\d{9,10}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Số điện thoại không hợp lệ';
    if (form.high_school_score !== '') {
      const v = parseFloat(form.high_school_score);
      if (isNaN(v) || v < 0 || v > 10) errs.high_school_score = 'Điểm phải từ 0 đến 10';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.major_id) errs.major_id = 'Vui lòng chọn ngành đào tạo';
    if (!form.method_id) errs.method_id = 'Vui lòng chọn phương thức xét tuyển';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const goBack = () => {
    setErrors({});
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        high_school_score: form.high_school_score ? parseFloat(form.high_school_score) : undefined,
      };
      const data = await applicationService.submitApplication(payload);
      setResult({ success: true, message: 'Hồ sơ đã được gửi thành công!', id: data.application?.id });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || err.message || 'Đã xảy ra lỗi' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setResult(null);
    setStep(1);
    setForm({ name: '', email: '', phone: '', high_school_score: '', major_id: '', method_id: '' });
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <HeroSection />

      <section className="max-w-7xl mx-auto px-4 py-10">
        {result ? (
          result.success
            ? <SuccessScreen result={result} onReset={resetAll} />
            : <ErrorScreen result={result} onReset={resetAll} />
        ) : (
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left — Form */}
            <div className="lg:col-span-3">
              {/* Step indicator */}
              <div className="mb-8">
                <StepIndicator step={step} />
              </div>

              <form onSubmit={handleSubmit}>
                {/* ──────── Step 1: Personal info ──────── */}
                {step === 1 && (
                  <div className="bg-white border border-slate-100 p-6 sm:p-8 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-slate-900">Thông tin cá nhân</h2>
                        <p className="text-[11px] text-slate-400">Vui lòng điền đầy đủ thông tin bên dưới</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FormInput
                        label="Họ và tên" required icon={User}
                        placeholder="Nguyễn Văn A"
                        value={form.name} onChange={(e) => update('name', e.target.value)}
                        error={errors.name}
                      />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormInput
                          label="Email" required icon={Mail} type="email"
                          placeholder="email@example.com"
                          value={form.email} onChange={(e) => update('email', e.target.value)}
                          error={errors.email}
                        />
                        <FormInput
                          label="Số điện thoại" required icon={Phone} type="tel"
                          placeholder="0901234567"
                          value={form.phone} onChange={(e) => update('phone', e.target.value)}
                          error={errors.phone}
                        />
                      </div>

                      <FormInput
                        label="Điểm TB THPT (12)" icon={Award} type="number"
                        placeholder="8.50" min="0" max="10" step="0.01"
                        value={form.high_school_score} onChange={(e) => update('high_school_score', e.target.value)}
                        error={errors.high_school_score}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={goNext}
                      className="w-full mt-6 bg-primary text-white text-sm font-bold py-3.5 hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
                    >
                      Tiếp tục <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ──────── Step 2: Major + Method ──────── */}
                {step === 2 && (
                  <div className="bg-white border border-slate-100 p-6 sm:p-8 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-violet-50 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-slate-900">Chọn ngành & Phương thức</h2>
                        <p className="text-[11px] text-slate-400">Chọn ngành đào tạo và phương thức xét tuyển</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* Major selector */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          Ngành đào tạo <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={form.major_id}
                            onChange={(e) => update('major_id', e.target.value)}
                            className={`w-full border ${errors.major_id ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'} px-4 py-3 text-sm bg-white focus:outline-none focus:border-primary appearance-none cursor-pointer transition-colors pr-10`}
                          >
                            <option value="">— Chọn ngành đào tạo —</option>
                            {Object.entries(groupedMajors).map(([faculty, fMajors]) => (
                              <optgroup key={faculty} label={faculty}>
                                {fMajors.map(m => (
                                  <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.major_id && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><XCircle className="w-3 h-3" />{errors.major_id}</p>}

                        {/* Selected major preview */}
                        {selectedMajor && (
                          <div className="mt-2 bg-primary/5 border border-primary/10 p-3 flex items-center gap-3 flex-wrap">
                            <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5">{selectedMajor.code}</span>
                            <span className="text-xs text-slate-600 font-medium">{selectedMajor.name}</span>
                            {selectedMajor.quota && (
                              <span className="text-[10px] text-slate-400 ml-auto">Chỉ tiêu: <strong>{selectedMajor.quota}</strong></span>
                            )}
                            {selectedMajor.tuition && Number(selectedMajor.tuition) > 0 && (
                              <span className="text-[10px] text-slate-400">
                                HP: <strong>{(Number(selectedMajor.tuition) / 1_000_000).toFixed(1)} tr/năm</strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Method selector */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5">
                          <Award className="w-3.5 h-3.5 text-primary" />
                          Phương thức xét tuyển <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={form.method_id}
                            onChange={(e) => update('method_id', e.target.value)}
                            className={`w-full border ${errors.method_id ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'} px-4 py-3 text-sm bg-white focus:outline-none focus:border-primary appearance-none cursor-pointer transition-colors pr-10`}
                          >
                            <option value="">— Chọn phương thức —</option>
                            {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.method_id && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><XCircle className="w-3 h-3" />{errors.method_id}</p>}

                        {selectedMethod?.description && (
                          <div className="mt-2 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                            <p className="text-xs text-slate-500 leading-relaxed">{selectedMethod.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={goBack}
                        className="flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-3.5 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="flex-1 bg-primary text-white text-sm font-bold py-3.5 hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
                      >
                        Tiếp tục <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ──────── Step 3: Confirm ──────── */}
                {step === 3 && (
                  <div className="bg-white border border-slate-100 p-6 sm:p-8 animate-fadeIn rounded-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-slate-900">Xác nhận thông tin</h2>
                        <p className="text-[11px] text-slate-400">Kiểm tra kỹ trước khi nộp hồ sơ</p>
                      </div>
                    </div>

                    {/* Review card */}
                    <div className="bg-slate-50 border border-slate-100 divide-y divide-slate-100">
                      <div className="p-4">
                        <h3 className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-3">Thông tin cá nhân</h3>
                        <div className="space-y-2 text-sm">
                          <ReviewRow icon={User} label="Họ tên" value={form.name} />
                          <ReviewRow icon={Mail} label="Email" value={form.email} />
                          <ReviewRow icon={Phone} label="Số điện thoại" value={form.phone} />
                          {form.high_school_score && (
                            <ReviewRow icon={Award} label="Điểm TB THPT" value={form.high_school_score} />
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-3">Ngành & Phương thức</h3>
                        <div className="space-y-2 text-sm">
                          <ReviewRow icon={BookOpen} label="Ngành đào tạo" value={
                            selectedMajor ? `${selectedMajor.code} — ${selectedMajor.name}` : form.major_id
                          } />
                          <ReviewRow icon={Award} label="Phương thức" value={selectedMethod?.name || form.method_id} />
                          {selectedMajor?.Faculty?.name && (
                            <ReviewRow icon={Building2} label="Khoa" value={selectedMajor.Faculty.name} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Note */}
                    <div className="mt-4 bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Bằng việc nhấn "Nộp hồ sơ", bạn xác nhận rằng thông tin trên là chính xác
                        và đồng ý với quy chế tuyển sinh của nhà trường.
                      </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={goBack}
                        className="flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-3.5 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-emerald-600 text-white text-sm font-bold py-3.5 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Nộp hồ sơ
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right sidebar */}
            <div className="lg:col-span-2 space-y-5">
              {/* Progress indicator */}
              <div className="bg-white border border-slate-100 p-6 rounded-xl">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  Tiến trình
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center gap-3">
                      <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold ${step > s ? 'bg-emerald-500 text-white' : step === s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                        {step > s ? '✓' : s}
                      </div>
                      <span className={`text-xs font-medium ${step >= s ? 'text-slate-700' : 'text-slate-400'}`}>
                        {s === 1 ? 'Thông tin cá nhân' : s === 2 ? 'Chọn ngành & PT' : 'Xác nhận & Nộp'}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div className="mt-4 w-full h-1.5 bg-slate-100">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white border border-slate-100 p-6 rounded-xl">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Yêu cầu hồ sơ
                </h3>
                <ul className="space-y-2">
                  {[
                    'Họ tên, email, số điện thoại liên hệ',
                    'Chọn ngành đào tạo mong muốn',
                    'Chọn phương thức xét tuyển',
                    'Điểm TB THPT (không bắt buộc)',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${(i === 0 && form.name && form.email && form.phone) ||
                          (i === 1 && form.major_id) ||
                          (i === 2 && form.method_id) ||
                          (i === 3 && form.high_school_score)
                          ? 'text-emerald-500' : 'text-slate-300'
                        }`} />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
                <h3 className="text-sm font-bold mb-3">Cần hỗ trợ?</h3>
                <p className="text-xs text-white/70 mb-4 leading-relaxed">
                  Liên hệ phòng Đào tạo nếu bạn cần tư vấn hoặc gặp khó khăn khi nộp hồ sơ.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-xs text-white/90">0236 3836 169</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-xs text-white/90">tuyensinh@due.edu.vn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-xs text-white/90">T2—T6, 7:30—17:00</span>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="space-y-2">
                {[
                  { icon: Award, label: 'Phương thức xét tuyển', to: '/phuong-thuc-xet-tuyen' },
                  { icon: BarChart3, label: 'Chỉ tiêu tuyển sinh', to: '/chi-tieu-tuyen-sinh' },
                  { icon: Target, label: 'Tra cứu điểm chuẩn', to: '/tra-cuu-diem-chuan' },
                ].map(a => {
                  const Icon = a.icon;
                  return (
                    <Link
                      key={a.to}
                      to={a.to}
                      className="flex items-center gap-3 bg-white border border-slate-100 p-4 hover:border-primary hover:shadow-sm transition-all group"
                    >
                      <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                        <Icon className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">{a.label}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300 ml-auto group-hover:text-primary transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ──────────────── REVIEW ROW ──────────────── */
function ReviewRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-primary/50 shrink-0" />
      <span className="text-slate-400 text-xs w-28 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}
