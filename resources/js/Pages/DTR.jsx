import { useState } from 'react';
import axios from 'axios';
import { Clock, FileText, Send, CheckCircle2, AlertCircle, Zap, Database, Hash, Loader2, Users } from 'lucide-react';
import { Head } from '@inertiajs/react';

export default function DTR() {
  const [logText, setLogText] = useState('');
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsingStats, setParsingStats] = useState(null);

  const format12Hour = (time) => {
    if (!time) return '--:--';
    let [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/generate', { logText, batchName: 'Public Generation' });
      setRecords(res.data.records);
      setParsingStats({
        duration: res.data.duration,
        recordCount: res.data.recordCount
      });
    } catch (err) {
      console.error(err);
      alert('Error parsing log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-green-100 selection:text-green-900">
      <Head title="Public Log Processor" />
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100 mb-6 group hover:shadow-md transition-all duration-500">
            <Zap className="w-4 h-4 text-green-700 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Public Access</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4 sm:text-6xl">
            Log <span className="text-green-700">Processor</span>
          </h1>
          <p className="mt-3 text-sm font-bold text-gray-500 uppercase tracking-widest max-w-2xl mx-auto">
            Automated DTR Generation System
          </p>
        </header>

        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* ==== LEFT: Input Section ==== */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="bg-green-700 p-10 text-white relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Process New Logs</h2>
                    <p className="text-white/90 text-[11px] font-bold uppercase tracking-widest italic">Copy and paste biometric data below</p>
                  </div>
                  <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md">
                    <Database className="text-green-50" size={28} />
                  </div>
                </div>
                <Users className="absolute -right-10 -bottom-10 text-white/5" size={250} />
              </div>

              <form onSubmit={generate} className="p-10 space-y-10">
                <div className="relative group">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-[0.3em]">Raw Attendance Matrix</label>
                    <span className="text-xs font-black text-green-700 bg-green-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">Live Parser ready</span>
                  </div>
                  <textarea
                    className="w-full p-10 bg-gray-50 border-none rounded-[40px] font-mono text-sm text-gray-700 h-80 focus:ring-4 focus:ring-green-500/10 transition-all shadow-inner resize-none overflow-y-auto placeholder:text-gray-400"
                    placeholder="ALEXANDRE JUSTIN REPIA, 2026-02-25, 08:00..."
                    value={logText}
                    onChange={(e) => setLogText(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <AlertCircle size={16} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Data Integrity</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Format: Name, Date, Time (In/Out)</p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-green-700 hover:bg-green-800 text-white px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all hover:shadow-2xl hover:shadow-green-700/30 active:scale-95 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap size={20} className="fill-current" />
                        Generate Records
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ==== RESULTS ==== */}
          {records && (
            <div className="lg:col-span-12 space-y-12 mt-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              {/* Performance Stats */}
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="bg-green-700 p-4 rounded-3xl shadow-lg shadow-green-700/20">
                    <Zap className="text-white w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Parser Performance</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900 tracking-tighter">
                        {parsingStats ? `${(parsingStats.duration / 1000).toFixed(3)}s` : '0.000s'}
                      </span>
                      <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-1 rounded-lg uppercase">
                        {parsingStats ? Math.round(parsingStats.recordCount / (parsingStats.duration / 1000)).toLocaleString() : 0} recs/sec
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-px w-full md:w-px md:h-12 bg-gray-100"></div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Throughput</p>
                  <p className="text-sm font-black text-gray-800 uppercase tracking-tight">
                    {parsingStats?.recordCount.toLocaleString() || 0} Total Records Processed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200"></div>
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-3">
                  <CheckCircle2 className="text-green-700" size={16} />
                  Generation Finalized
                </h2>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>

              {Object.entries(records).map(([employeeName, months], i) => (
                <div key={i} className="bg-white rounded-[50px] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-500">
                  <div className="bg-gray-50 p-10 flex items-center justify-between relative overflow-hidden border-b border-gray-100">
                    <div className="relative z-10 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Personnel Record</p>
                      </div>
                      <h3 className="font-black text-3xl sm:text-4xl text-gray-900 tracking-tighter">
                        {employeeName}
                      </h3>
                    </div>
                    <div className="hidden sm:flex bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex-col items-center group-hover:scale-105 transition-transform duration-500">
                      <Users size={28} className="text-green-700 mb-2" />
                      <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-none">Identity</span>
                    </div>
                  </div>

                  <div className="p-10 space-y-12">
                    {Object.entries(months).map(([monthKey, days], j) => (
                      <div key={j} className="bg-gray-50/50 rounded-[40px] overflow-hidden border border-gray-100">
                        <header className="px-10 py-6 flex justify-between items-center bg-white border-b border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-2.5 rounded-xl">
                              <FileText className="text-green-700" size={18} />
                            </div>
                            <span className="font-black text-gray-800 text-sm uppercase tracking-widest">{monthKey}</span>
                          </div>
                          <span className="text-[11px] font-black text-white bg-green-700 px-4 py-2 rounded-full uppercase tracking-tighter">
                            {Object.keys(days).length} Entries
                          </span>
                        </header>

                        <div className="overflow-x-auto text-center">
                          <table className="w-full text-xs">
                            <thead className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] bg-white/50">
                              <tr>
                                <th className="px-10 py-6 text-left selection:bg-green-100">Date/Weekday</th>
                                <th className="px-5 py-6 font-bold">In</th>
                                <th className="px-5 py-6 font-bold">Break Out</th>
                                <th className="px-5 py-6 font-bold">Break In</th>
                                <th className="px-5 py-6 font-bold">Out</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50">
                              {Object.entries(days).map(([date, row], k) => (
                                <tr key={k} className="hover:bg-white transition-all duration-300 group/tr">
                                  <td className="px-10 py-5 text-left font-bold text-gray-800">
                                    {date} <span className="text-gray-500 font-bold text-[11px] ml-1 uppercase transition-colors group-hover/tr:text-green-600">({row.weekday})</span>
                                  </td>
                                  <td className="px-5 py-5">
                                    <span className="font-mono font-black text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                                      {format12Hour(row.in)}
                                    </span>
                                  </td>
                                  <td className="px-5 py-5">
                                    <span className="font-mono font-bold text-xs text-orange-700 bg-orange-50/50 px-2 py-1 rounded-lg">
                                      {format12Hour(row.breakOut)}
                                    </span>
                                  </td>
                                  <td className="px-5 py-5">
                                    <span className="font-mono font-bold text-xs text-orange-700 bg-orange-50/50 px-2 py-1 rounded-lg">
                                      {format12Hour(row.breakIn)}
                                    </span>
                                  </td>
                                  <td className="px-5 py-5 border-l border-gray-200">
                                    <span className="font-mono font-black text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                                      {format12Hour(row.out)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
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
        </div>
      </div>

      <footer className="mt-20 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">Powered by DENR Matrix Engine</p>
      </footer>
    </div>
  );
}
