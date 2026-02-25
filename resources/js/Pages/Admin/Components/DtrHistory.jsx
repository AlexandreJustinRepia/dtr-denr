import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FileText, Calendar, Hash, RefreshCw, Loader2, History } from 'lucide-react';

export default function DtrHistory({ onReprocess, refreshSignal }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/dtr/history');
      const data = response.data;

      // Handle Laravel pagination: actual array is in .data property
      // If it's already an array, use it directly.
      const historyData = Array.isArray(data) ? data : (data?.data || []);

      setHistory(historyData);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshSignal]);

  if (loading && (!history || history.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="animate-spin text-green-600" size={24} />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing records...</p>
      </div>
    );
  }

  if (!Array.isArray(history) || history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <History size={20} className="text-gray-300" />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
      {history.map((batch) => (
        <div
          key={batch.id}
          className="group bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 p-5 rounded-3xl transition-all duration-300 relative overflow-hidden"
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-white p-2 rounded-xl shadow-sm text-green-600">
                  <FileText size={16} />
                </div>
                <h4 className="font-black text-xs text-gray-800 uppercase tracking-tighter truncate max-w-[150px]">
                  {batch.batch_name}
                </h4>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-tight">
                    {batch.created_at ? format(new Date(batch.created_at), 'MMM dd, yyyy') : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Hash size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-tight">
                    Batch #{batch.id}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onReprocess(batch.id)}
              className="bg-white p-3 rounded-2xl text-gray-400 hover:text-green-600 shadow-sm hover:shadow-lg hover:shadow-green-600/10 transition-all active:scale-95 group-hover:translate-x-1"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}