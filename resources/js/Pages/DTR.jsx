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
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded border border-gray-200 mb-4">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Public Access</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Log Processor
          </h1>
          <p className="text-sm font-medium text-gray-600">
            Automated DTR Generation System
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* ==== LEFT: Input Section ==== */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Process New Logs</h2>
                    <p className="text-sm text-gray-500">Paste raw biometric data below</p>
                  </div>
                  <Database className="text-gray-400" size={20} />
                </div>
              </div>

              <form onSubmit={generate} className="p-6 space-y-6">
                <div className="relative group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Raw Attendance Data</label>
                  </div>
                  <textarea
                    className="w-full p-4 bg-white border border-gray-300 rounded font-mono text-sm text-gray-700 h-64 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors resize-none overflow-y-auto placeholder:text-gray-400"
                    placeholder="ALEXANDRE JUSTIN REPIA, 2026-02-25, 08:00..."
                    value={logText}
                    onChange={(e) => setLogText(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500">
                    <AlertCircle size={16} />
                    <p className="text-sm font-medium">Format: Name, Date, Time (In/Out)</p>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
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
            <div className="lg:col-span-12 space-y-8 mt-8">
              {/* Performance Stats */}
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 p-3 rounded">
                    <Zap className="text-green-700 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Parser Performance</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        {parsingStats ? `${(parsingStats.duration / 1000).toFixed(3)}s` : '0.000s'}
                      </span>
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                        {parsingStats ? Math.round(parsingStats.recordCount / (parsingStats.duration / 1000)).toLocaleString() : 0} recs/sec
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-px w-full md:w-px md:h-10 bg-gray-200"></div>
                <div className="text-center md:text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Throughput</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {parsingStats?.recordCount.toLocaleString() || 0} Records Processed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200"></div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                  <CheckCircle2 className="text-green-700" size={14} />
                  Generation Finalized
                </h2>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>

              {Object.entries(records).map(([employeeName, months], i) => (
                <div key={i} className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden mb-6">
                  <div className="bg-gray-50 p-6 flex items-center justify-between border-b border-gray-200">
                    <div className="text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Personnel Record</p>
                      </div>
                      <h3 className="font-bold text-xl sm:text-2xl text-gray-900">
                        {employeeName}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {Object.entries(months).map(([monthKey, days], j) => (
                      <div key={j} className="bg-white rounded border border-gray-200 overflow-hidden">
                        <header className="px-6 py-4 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <FileText className="text-gray-500" size={16} />
                            <span className="font-semibold text-gray-800 text-sm uppercase">{monthKey}</span>
                          </div>
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                            {Object.keys(days).length} Entries
                          </span>
                        </header>

                        <div className="overflow-x-auto text-center">
                          <table className="w-full text-sm">
                            <thead className="text-xs font-semibold text-gray-600 uppercase bg-white border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left">Date/Weekday</th>
                                <th className="px-4 py-3">In</th>
                                <th className="px-4 py-3">Break Out</th>
                                <th className="px-4 py-3">Break In</th>
                                <th className="px-4 py-3">Out</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-gray-800">
                              {Object.entries(days).map(([date, row], k) => (
                                <tr key={k} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-3 text-left font-medium">
                                    {date} <span className="text-gray-500 text-xs ml-1 font-normal">({row.weekday})</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="font-medium text-gray-900">
                                      {format12Hour(row.in)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="font-medium text-gray-900">
                                      {format12Hour(row.breakOut)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="font-medium text-gray-900">
                                      {format12Hour(row.breakIn)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 border-l border-gray-200">
                                    <span className="font-medium text-gray-900">
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

      <footer className="mt-12 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} DENR PENRO Bulacan</p>
      </footer>
    </div>
  );
}
