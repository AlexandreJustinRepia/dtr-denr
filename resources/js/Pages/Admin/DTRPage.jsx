import { useState } from 'react';
import axios from 'axios';
import {
  Clock,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  ChevronRight,
  Hash,
  Database,
  History,
  Zap,
  Users,
  ChevronDown,
  Download,
  Trash2
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DTRHistory from '@/Pages/Admin/Components/DtrHistory';

export default function DTRPage() {
  const [logText, setLogText] = useState('');
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [batchId, setBatchId] = useState(null);
  const [batchName, setBatchName] = useState('');
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [parsingStats, setParsingStats] = useState(null);
  const [useStrictStatus, setUseStrictStatus] = useState(true);

  const generate = async e => {
    e.preventDefault();
    if (!batchName.trim()) {
      alert('Please enter a batch name.');
      return;
    }

    setLoading(true);
    setAlreadySaved(false);
    setRecords(null);

    try {
      const { data } = await axios.post('/generate', { logText, batchName, useStrictStatus });
      setRecords(data.records);
      setAlreadySaved(data.alreadySaved);
      setBatchId(data.batchId);
      setParsingStats({
        duration: data.duration,
        recordCount: data.recordCount
      });

      if (!data.alreadySaved) {
        setRefreshSignal(prev => prev + 1);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const reprocess = async id => {
    try {
      const { data } = await axios.get(`/admin/dtr/batch/${id}/raw`);
      setLogText(data.raw_log);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('Failed to load batch');
    }
  };

  const format12Hour = (time) => {
    if (!time) return '--:--';
    let [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <AuthenticatedLayout header="Log Processor">
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* ==== LEFT/MAIN: Input Section ==== */}
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase">Process Biometric Logs</h2>
                  <p className="text-[10px] font-medium text-gray-500 uppercase mt-0.5">Upload and parse raw attendance data</p>
                </div>
                <div className="text-gray-400">
                  <Database size={20} />
                </div>
              </div>

              <form onSubmit={generate} className="p-6 space-y-6">
                {/* Batch Name Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Batch Identification</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="text-gray-400" size={14} />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-9 pr-4 py-2 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-green-500/10 focus:border-green-600 transition-colors"
                      placeholder="e.g., Biometric Batch - Mar 2025"
                      value={batchName}
                      onChange={e => setBatchName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Log Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase">Raw Attendance Data</label>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded uppercase">Standard Biometric Format</span>
                  </div>
                  <textarea
                    className="w-full p-4 rounded border border-gray-300 font-mono text-xs text-gray-600 h-64 focus:ring-2 focus:ring-green-500/10 focus:border-green-600 transition-colors resize-none"
                    placeholder="Paste raw log data here (Name, Date, Time)..."
                    value={logText}
                    onChange={e => setLogText(e.target.value)}
                    required
                  />

                  {alreadySaved && batchId && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded flex items-center gap-3 text-amber-800 shadow-sm">
                      <Clock size={16} className="text-amber-600" />
                      <span className="text-xs font-medium uppercase">
                        Duplicate detected: <strong className="font-bold">Batch #{batchId}</strong> already exists in the system.
                      </span>
                    </div>
                  )}
                </div>

                {/* Toggle for Strict Status */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setUseStrictStatus(!useStrictStatus)}
                    className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${useStrictStatus ? 'bg-green-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${useStrictStatus ? 'translate-x-5' : 'translate-x-1'}`}></div>
                  </button>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Apply Strict Attendance Rules</p>
                    <p className="text-[10px] text-gray-500">Enforces rigid time checks and ignores entries without proper status indicators.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-medium uppercase">Review data format before processing</span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        Parse Data
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ==== Results Visualization ==== */}
            {records && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" size={18} />
                    Parsed Results
                  </h2>
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded uppercase">
                    {Object.keys(records).length} Employees Found
                  </span>
                </div>

                {Object.entries(records).map(([name, months]) => (
                  <div key={name} className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Personnel Name</p>
                        <h3 className="font-bold text-lg text-gray-900 uppercase">
                          {name}
                        </h3>
                      </div>
                      <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                        <Users size={16} />
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {Object.entries(months).map(([monthKey, days]) => (
                        <div key={monthKey} className="border border-gray-200 rounded overflow-hidden">
                          <header className="px-4 py-2 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                            <span className="font-bold text-gray-700 text-[10px] uppercase">{monthKey}</span>
                            <span className="text-[9px] font-bold text-green-700 bg-white border border-green-200 px-2 py-0.5 rounded uppercase">
                              {Object.keys(days).length} Entries
                            </span>
                          </header>
                          <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                              <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-2 text-left">Date/Weekday</th>
                                  <th className="px-2 py-2 text-center">In</th>
                                  <th className="px-2 py-2 text-center">B/Out</th>
                                  <th className="px-2 py-2 text-center">B/In</th>
                                  <th className="px-2 py-2 text-center">Out</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {Object.entries(days).map(([date, row], idx) => (
                                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-1.5 font-semibold text-gray-700 whitespace-nowrap">
                                      {date} <span className="text-gray-400 font-medium text-[9px]">({row.weekday})</span>
                                    </td>
                                    <td className="px-2 py-1.5 text-center font-mono font-bold text-green-700">
                                      {format12Hour(row.in)}
                                    </td>
                                    <td className="px-2 py-1.5 text-center font-mono text-gray-500">
                                      {format12Hour(row.breakOut)}
                                    </td>
                                    <td className="px-2 py-1.5 text-center font-mono text-gray-500">
                                      {format12Hour(row.breakIn)}
                                    </td>
                                    <td className="px-2 py-1.5 text-center font-mono font-bold text-red-700 border-l border-gray-50">
                                      {format12Hour(row.out)}
                                    </td>
                                  </tr>
                                )).slice(0, 5)}
                                {Object.keys(days).length > 5 && (
                                  <tr>
                                    <td colSpan="5" className="px-4 py-2 text-center text-gray-400 italic bg-gray-50 text-[10px] uppercase">
                                      + {Object.keys(days).length - 5} More Days Hidden
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ==== RIGHT: History & Quick Insights ==== */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Insights Card */}
            <div className="bg-white rounded border border-gray-200 p-6 shadow-sm relative overflow-hidden">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-4">Parsing Performance</p>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {parsingStats ? `${(parsingStats.duration / 1000).toFixed(3)}s` : '0.000s'}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Process Time</p>
                  </div>
                  {parsingStats && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-700">
                        {Math.round(parsingStats.recordCount / (parsingStats.duration / 1000)).toLocaleString()}
                      </p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase">Records / Sec</p>
                    </div>
                  )}
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600"
                    style={{ width: parsingStats ? '100%' : '0%' }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  {parsingStats
                    ? `Processed ${parsingStats.recordCount.toLocaleString()} records in ${parsingStats.duration}ms.`
                    : 'System optimized for high-volume biometric data parsing.'}
                </p>
              </div>
            </div>

            {/* History Feed */}
            <div className="bg-white rounded border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xs text-gray-800 uppercase flex items-center gap-2">
                  <History size={14} className="text-gray-400" />
                  Recent Batch Uploads
                </h3>
              </div>
              <DTRHistory onReprocess={reprocess} refreshSignal={refreshSignal} />
            </div>

            {/* Legend Card */}
            <div className="bg-gray-800 rounded p-6 text-white shadow-sm border border-gray-700">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Color Legend</p>
              <div className="space-y-3">
                {[
                  { label: 'Time In', color: 'bg-green-500', desc: 'Validated morning entry' },
                  { label: 'Time Out', color: 'bg-red-500', desc: 'Validated evening exit' },
                  { label: 'Break Times', color: 'bg-gray-400', desc: 'Noontime biometric logs' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${item.color}`}></div>
                    <div>
                      <p className="text-[10px] font-bold uppercase leading-none">{item.label}</p>
                      <p className="text-[9px] text-gray-400 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}