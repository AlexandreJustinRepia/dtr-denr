import { useState } from 'react';
import axios from 'axios';
import { Clock, Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-green-800 flex items-center gap-3">
            <Upload className="w-8 h-8 text-green-600" />
            DTR Log Generator
          </h1>
          <p className="text-gray-600 mt-1">Paste raw attendance logs to generate structured DTR data.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ==== LEFT: Form ==== */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 md:p-6">
              <form onSubmit={generate} className="space-y-5">
                {/* Batch Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Batch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="e.g., Biometric Logs - November 2025"
                    value={batchName}
                    onChange={e => setBatchName(e.target.value)}
                    required
                  />
                </div>

                {/* Log Textarea */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attendance Log Data <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm h-64 md:h-80 focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                    placeholder="Paste raw biometric logs here (one entry per line)..."
                    value={logText}
                    onChange={e => setLogText(e.target.value)}
                    required
                  />
                  
                  {alreadySaved && batchId && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Already uploaded as <strong>Batch #{batchId}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Generate DTR
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* ==== Parsed Results ==== */}
            {records && (
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Parsed DTR Records
                </h2>

                {Object.entries(records).map(([name, months]) => (
                  <div key={name} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
                      <h3 className="font-semibold text-lg">{name}</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {Object.entries(months).map(([monthKey, monthGroup]) => (
                        <details key={monthKey} className="group">
                          <summary className="cursor-pointer font-medium text-green-700 hover:text-green-800 flex items-center justify-between py-2 border-b border-gray-200">
                            <span>{monthKey}</span>
                            <span className="text-xs text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto font-mono text-gray-700">
                            {JSON.stringify(monthGroup, null, 2)}
                          </pre>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ==== RIGHT: History ==== */}
          <DTRHistory onReprocess={reprocess} refreshSignal={refreshSignal} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}