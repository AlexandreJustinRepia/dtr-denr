import { useState } from 'react';
import axios from 'axios';
import { Clock, FileText, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DTR() {
  const [logText, setLogText] = useState('');
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);

  const format12Hour = (time) => {
    if (!time) return '-';
    let [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/generate', { logText });
      setRecords(res.data.records);
    } catch (err) {
      console.error(err);
      alert('Error parsing log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
            DTR <span className="text-green-600">Generator</span>
          </h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            Transform raw attendance logs into professionally formatted Daily Time Records in seconds.
          </p>
        </header>

        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-gray-200/50 rounded-3xl p-8 mb-12">
          <form onSubmit={generate} className="space-y-6">
            <div className="relative group">
              <textarea
                className="w-full h-64 border-none bg-gray-50/50 rounded-2xl p-6 text-sm font-mono text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500/20 transition-all resize-none shadow-inner"
                placeholder="Paste your attendance logs here..."
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                required
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-focus-within:border-green-500/20 rounded-2xl transition-all"></div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Format: Employee Name, Date, Time (In/Out/Break)
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-green-600/20 disabled:opacity-50 active:scale-95"
                disabled={loading}
              >
                {loading ? 'Processing...' : (
                  <>
                    <Send className="w-4 h-4" />
                    Generate Records
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {records && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {Object.entries(records).map(([employeeName, months], i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gray-100"></div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 px-4">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    {employeeName}
                  </h2>
                  <div className="h-px flex-1 bg-gray-100"></div>
                </div>

                <div className="space-y-8">
                  {Object.entries(months).map(([monthKey, days], j) => (
                    <div key={j} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-600 uppercase tracking-widest text-xs">{monthKey}</h3>
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">{Object.keys(days).length} Entries</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                              <th className="px-8 py-5 text-left bg-gray-50/20">Date / Weekday</th>
                              <th className="px-5 py-5 text-center">In</th>
                              <th className="px-5 py-5 text-center">Break Out</th>
                              <th className="px-5 py-5 text-center">Break In</th>
                              <th className="px-5 py-5 text-center bg-gray-50/20">Out</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {Object.entries(days).map(([date, row], k) => (
                              <tr key={k} className="hover:bg-green-50/30 transition-colors group/row">
                                <td className="px-8 py-4 font-bold text-gray-700">
                                  {date} <span className="text-gray-400 font-medium text-xs ml-1 opacity-0 group-hover/row:opacity-100 transition-opacity">({row.weekday})</span>
                                </td>
                                <td className="px-5 py-4 text-center font-mono font-bold text-green-600">{format12Hour(row.in)}</td>
                                <td className="px-5 py-4 text-center font-mono text-orange-500/70">{format12Hour(row.breakOut)}</td>
                                <td className="px-5 py-4 text-center font-mono text-orange-500/70">{format12Hour(row.breakIn)}</td>
                                <td className="px-5 py-4 text-center font-mono font-bold text-red-500 bg-gray-50/10">{format12Hour(row.out)}</td>
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
  );
}
