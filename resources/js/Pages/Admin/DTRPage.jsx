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
      const { data } = await axios.post('/generate', { logText, batchName });
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
      <div className="max-w-7xl mx-auto">

        <div className="grid gap-10 lg:grid-cols-12">
          {/* ==== LEFT/MAIN: Input Section ==== */}
          <section className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-green-700 p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Upload New Logs</h2>
                    <p className="text-green-200 text-xs font-bold uppercase tracking-widest opacity-80">System is ready for processing</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <Zap className="text-green-300" size={24} />
                  </div>
                </div>
                {/* Abstract Decor */}
                <Database className="absolute -right-10 -bottom-10 text-white/5" size={200} />
              </div>

              <form onSubmit={generate} className="p-10 space-y-8">
                {/* Batch Name Input */}
                <div className="relative group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Batch Identification</label>
                  <div className="relative">
                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" size={18} />
                    <input
                      type="text"
                      className="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-green-500/20 transition-all shadow-inner"
                      placeholder="e.g., Biometric Batch - Mar 2025"
                      value={batchName}
                      onChange={e => setBatchName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Log Textarea */}
                <div className="relative group">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Raw Attendance Data</label>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg uppercase tracking-widest">Biometric Format</span>
                  </div>
                  <textarea
                    className="w-full p-8 bg-gray-50 border-none rounded-[32px] font-mono text-xs text-gray-600 h-80 focus:ring-2 focus:ring-green-500/20 transition-all shadow-inner resize-none overflow-y-auto"
                    placeholder="Paste raw log data here (Name, Date, Time)..."
                    value={logText}
                    onChange={e => setLogText(e.target.value)}
                    required
                  />

                  {alreadySaved && batchId && (
                    <div className="absolute bottom-6 right-6 p-4 bg-white/80 backdrop-blur-md border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700 shadow-xl animate-in fade-in zoom-in-95 duration-300">
                      <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                        <Clock size={16} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-tighter">
                        Detected as <strong className="text-amber-900">Batch #{batchId}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-gray-400">
                    <AlertCircle size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest italic leading-none">Ensure records are formatted correctly</span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all hover:shadow-2xl hover:shadow-green-600/30 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Parsing Data...
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        Generate Records
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ==== Results Visualization ==== */}
            {records && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="flex items-center justify-between px-6">
                  <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                    <CheckCircle2 className="text-green-600" size={24} />
                    Parsed Results
                  </h2>
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                    {Object.keys(records).length} Employees Found
                  </span>
                </div>

                {Object.entries(records).map(([name, months]) => (
                  <div key={name} className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:shadow-green-900/5 transition-all duration-500">
                    <div className="bg-gray-50 p-8 flex items-center justify-between relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                          <p className="text-[10px] font-black text-gray-400 capitalize tracking-widest">Personnel</p>
                        </div>
                        <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3 lowercase first-letter:uppercase tracking-tight">
                          {name}
                        </h3>
                      </div>
                      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col items-center">
                        <Users size={20} className="text-green-600 mb-1" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Record</span>
                      </div>
                    </div>

                    <div className="p-8 space-y-8">
                      {Object.entries(months).map(([monthKey, days]) => (
                        <div key={monthKey} className="bg-gray-50 flex flex-col rounded-[32px] overflow-hidden border border-gray-100/50">
                          <header className="px-8 py-4 flex justify-between items-center bg-white border-b border-gray-50">
                            <span className="font-black text-gray-700 text-xs uppercase tracking-widest">{monthKey}</span>
                            <div className="flex gap-2">
                              <span className="text-[9px] font-black text-white bg-green-600 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                                {Object.keys(days).length} Entries
                              </span>
                            </div>
                          </header>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                <tr>
                                  <th className="px-8 py-5 text-left font-medium">Date/Weekday</th>
                                  <th className="px-5 py-5 text-center font-medium">In</th>
                                  <th className="px-5 py-5 text-center font-medium">Break Out</th>
                                  <th className="px-5 py-5 text-center font-medium">Break In</th>
                                  <th className="px-5 py-5 text-center font-medium">Out</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white">
                                {Object.entries(days).map(([date, row], idx) => (
                                  <tr key={idx} className="hover:bg-white transition-colors group/tr">
                                    <td className="px-8 py-4 font-bold text-gray-700">
                                      {date} <span className="text-gray-400 font-medium text-[10px] ml-1">({row.weekday})</span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                      <span className="font-mono font-black text-[10px] text-green-600">
                                        {format12Hour(row.in)}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                      <span className="font-mono font-bold text-[10px] text-orange-500/70">
                                        {format12Hour(row.breakOut)}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                      <span className="font-mono font-bold text-[10px] text-orange-500/70">
                                        {format12Hour(row.breakIn)}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-center border-l border-gray-100/50">
                                      <span className="font-mono font-black text-[10px] text-red-500">
                                        {format12Hour(row.out)}
                                      </span>
                                    </td>
                                  </tr>
                                )).slice(0, 5)}
                                {Object.keys(days).length > 5 && (
                                  <tr>
                                    <td colSpan="5" className="px-8 py-5 text-center text-gray-400 italic bg-white/20 font-bold text-[10px] uppercase tracking-widest">
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
          <aside className="lg:col-span-4 space-y-10">
            {/* Insights Card */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.3em] mb-4">Actual Parsing Speed</p>
              <div className="space-y-6 relative z-10">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-black text-gray-900 tracking-tighter">
                      {parsingStats ? `${(parsingStats.duration / 1000).toFixed(3)}s` : '0.000s'}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Parse Duration</p>
                  </div>
                  {parsingStats && (
                    <div className="text-right">
                      <p className="text-xl font-black text-green-700 tracking-tighter">
                        {Math.round(parsingStats.recordCount / (parsingStats.duration / 1000)).toLocaleString()}
                      </p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest italic">Records / Sec</p>
                    </div>
                  )}
                </div>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-1000 ease-out"
                    style={{ width: parsingStats ? '100%' : '0%' }}
                  ></div>
                </div>
                <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                  {parsingStats
                    ? `Processed ${parsingStats.recordCount.toLocaleString()} attendance records in ${parsingStats.duration}ms with ultra-low latency.`
                    : 'The parser is optimized to handle thousands of records in milliseconds. High efficiency is maintained.'}
                </p>
              </div>
              <Zap className="absolute -right-2 -bottom-2 text-green-50/50 group-hover:scale-110 transition-transform duration-700" size={100} />
            </div>

            {/* History Feed */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-sm text-gray-800 uppercase tracking-widest flex items-center gap-2">
                  <History size={16} className="text-green-600" />
                  Recent Cycles
                </h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              <DTRHistory onReprocess={reprocess} refreshSignal={refreshSignal} />
            </div>

            {/* Legend Card */}
            <div className="bg-gray-900 rounded-[32px] p-8 text-white shadow-2xl shadow-gray-900/20">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">Status Legend</p>
              <div className="space-y-4">
                {[
                  { label: 'Standard In', color: 'bg-green-500', desc: 'Auto-parsed valid entry' },
                  { label: 'Standard Out', color: 'bg-red-500', desc: 'Auto-parsed valid exit' },
                  { label: 'Unverified', color: 'bg-amber-500', desc: 'Manual review suggested' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight">{item.label}</p>
                      <p className="text-[8px] font-bold text-white/30 lowercase">{item.desc}</p>
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