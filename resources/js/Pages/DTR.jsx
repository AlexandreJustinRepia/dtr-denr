import { useState } from 'react';
import axios from 'axios';

export default function DTR() {
  const [logText, setLogText] = useState('');
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/generate', { logText });
      setRecords(res.data.records);
    } catch (err) {
      alert('Error parsing log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-4">DTR Generator</h1>

      <form onSubmit={generate} className="mb-6 space-y-3">
        <textarea
          className="w-full border rounded-lg p-3 text-sm font-mono"
          rows={8}
          placeholder="Paste attendance log here..."
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Generating...' : 'Generate DTR'}
        </button>
      </form>

      {records && (
        <div className="space-y-6">
          {Object.entries(records).map(([name, months], i) => (
            <div key={i} className="border rounded-lg p-4 shadow bg-white">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">{name}</h2>
              {Object.entries(months).map(([monthKey, days], j) => (
                <div key={j} className="mt-3">
                  <h3 className="font-semibold text-gray-700 mb-1">{monthKey}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="p-2 border">Date</th>
                          <th className="p-2 border">In</th>
                          <th className="p-2 border">Break Out</th>
                          <th className="p-2 border">Break In</th>
                          <th className="p-2 border">Out</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(days).map(([date, row], k) => (
                          <tr key={k} className="text-center border-t">
                            <td className="p-2 border">{date} ({row.weekday})</td>
                            <td className="p-2 border">{row.in || '-'}</td>
                            <td className="p-2 border">{row.breakOut || '-'}</td>
                            <td className="p-2 border">{row.breakIn || '-'}</td>
                            <td className="p-2 border">{row.out || '-'}</td>
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
