import { useState } from 'react';
import axios from 'axios';
import { ClockIcon } from 'lucide-react';
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

  // Generate DTR
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
        // Trigger refresh in DTRHistory
        setRefreshSignal(prev => prev + 1);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Reprocess a batch (passed to DTRHistory)
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
      <div className="max-w-7xl mx-auto p-4 md:p-6 grid gap-6 lg:grid-cols-3">
        {/* ==== LEFT: Form ==== */}
        <section className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-4">DTR Generator</h1>

          <form onSubmit={generate} className="space-y-4">
            {/* Batch Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Batch Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter batch name"
                value={batchName}
                onChange={e => setBatchName(e.target.value)}
                required
              />
            </div>

            {/* Log Textarea */}
            <div>
              <textarea
                className="w-full p-3 border rounded-md font-mono text-sm h-48 md:h-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste attendance logs here..."
                value={logText}
                onChange={e => setLogText(e.target.value)}
                required
              />
              {alreadySaved && batchId && (
                <p className="mt-2 text-sm text-amber-600 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Already uploaded (batch #{batchId})
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md disabled:opacity-60"
            >
              {loading ? 'Processing…' : 'Generate DTR'}
            </button>
          </form>

          {/* ==== Parsed result ==== */}
          {records && (
            <div className="mt-8 overflow-x-auto">
              {Object.entries(records).map(([name, months]) => (
                <div key={name} className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
                  <h2 className="text-lg font-semibold text-blue-700">{name}</h2>
                  {Object.entries(months).map(([monthKey, monthGroup]) => (
                    <div key={monthKey} className="mt-3">
                      <h3 className="font-medium">{monthKey}</h3>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(monthGroup, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ==== RIGHT: Upload History ==== */}
        <DTRHistory onReprocess={reprocess} refreshSignal={refreshSignal} />
      </div>
    </AuthenticatedLayout>
  );
}
