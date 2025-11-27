import { useState } from 'react';
import axios from 'axios';
import { Clock } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">DTR Generator</h1>

      <form onSubmit={generate} className="mb-6 space-y-3">
        <textarea
          className="w-full border rounded-lg p-3 text-sm font-mono resize-none"
          rows={8}
          placeholder="Paste attendance log here..."
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
          required
        />
        <button
          type="submit"
          className={`w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2`}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate DTR'}
        </button>
      </form>

      {records && (
        <div className="space-y-8">
          {Object.entries(records).map(([employeeName, months], i) => (
            <div key={i} className="bg-white border rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold text-green-700 flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" /> {employeeName}
              </h2>

              {Object.entries(months).map(([monthKey, days], j) => (
                <div key={j} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">{monthKey}</h3>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-green-50 text-green-800 font-semibold">
                        <tr>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-center">In</th>
                          <th className="px-4 py-2 text-center">Break Out</th>
                          <th className="px-4 py-2 text-center">Break In</th>
                          <th className="px-4 py-2 text-center">Out</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(days).map(([date, row], k) => (
                          <tr key={k} className="hover:bg-green-50 transition">
                            <td className="px-4 py-2 font-medium">{date} ({row.weekday})</td>
                            <td className="px-4 py-2 text-center font-mono text-green-700">{format12Hour(row.in)}</td>
                            <td className="px-4 py-2 text-center font-mono text-orange-600">{format12Hour(row.breakOut)}</td>
                            <td className="px-4 py-2 text-center font-mono text-orange-600">{format12Hour(row.breakIn)}</td>
                            <td className="px-4 py-2 text-center font-mono text-red-600">{format12Hour(row.out)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
