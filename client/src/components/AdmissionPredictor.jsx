import { useState, useEffect } from 'react';
import { TrendingUp, RotateCcw, AlertCircle } from 'lucide-react';
import { majorService, historicalScoreService } from '../services';

export default function AdmissionPredictor() {
  const [majors, setMajors] = useState([]);
  const [majorId, setMajorId] = useState('');
  const [score, setScore] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    majorService.getAllMajors({ limit: 200 }).then(d => setMajors(d.data || [])).catch(() => {});
  }, []);

  const predict = async () => {
    if (!majorId || !score) return;
    try {
      setLoading(true);
      const data = await historicalScoreService.predictAdmission({ major_id: majorId, user_score: parseFloat(score) });
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const colors = { Safe: 'text-green-600', Moderate: 'text-yellow-600', Risky: 'text-red-600' };
  const labels = { Safe: 'An toàn', Moderate: 'Trung bình', Risky: 'Rủi ro' };

  return (
    <div className="bg-white border border-slate-100 p-5 rounded-xl">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" /> Dự đoán trúng tuyển
      </h3>
      <div className="space-y-3">
        <select value={majorId} onChange={(e) => setMajorId(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
          <option value="">Chọn ngành</option>
          {majors.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
        </select>
        <input type="number" step="0.25" min="0" max="30" placeholder="Tổng điểm" value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
        <button onClick={predict} disabled={!majorId || !score || loading}
          className="w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50 hover:bg-primary-light transition-colors">
          {loading ? 'Đang phân tích...' : 'Kiểm tra'}
        </button>
      </div>

      {result && !result.error && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
          <p className={`text-sm font-bold ${colors[result.prediction]}`}>{labels[result.prediction]}</p>
          <p className="text-xs text-slate-500 mt-1">{result.recommendation}</p>
        </div>
      )}
      {result?.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />{result.error}
        </div>
      )}
    </div>
  );
}
