import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Download, RefreshCw, Calendar, FileText, Loader2, Clock } from 'lucide-react';

export default function DTRHistory({ onReprocess, refreshSignal }) {
  const [batches, setBatches] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadHistory = async (p = 1) => {
    if (p === 1) setLoading(true);
    try {
      const { data } = await axios.get('/admin/dtr/history', { params: { page: p } });
      if (p === 1) setBatches(data.data);
      else setBatches(prev => [...prev, ...data.data]);
      setHasMore(data.current_page < data.last_page);
      setPage(data.current_page);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, [refreshSignal]);

  return (
    <aside className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 sticky top-6">
        <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-green-600" />
          Upload History
        </h2>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {loading && page === 1 ? (
            // Skeleton Loader
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-lg">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : batches.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No upload history yet.</p>
          ) : (
            batches.map(b => (
              <div
                key={b.id}
                className="group p-4 border border-gray-100 rounded-xl hover:border-green-300 hover:shadow-lg hover:shadow-green-500/5 transition-all bg-white relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate group-hover:text-green-700 transition-colors">{b.batch_name}</p>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-2">
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded">
                        <Calendar className="w-2.5 h-2.5" />
                        {format(new Date(b.uploaded_at), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(b.uploaded_at), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 font-medium mt-1">
                      {b.record_count} record{b.record_count !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onReprocess(b.id)}
                      title="Reprocess this batch"
                      className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <a
                      href={`/admin/dtr/batch/${b.id}/download`}
                      className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition"
                      title="Download JSON"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <button
            onClick={() => loadHistory(page + 1)}
            disabled={loading}
            className="mt-4 w-full py-2 text-sm font-medium text-green-600 hover:text-green-700 border border-green-200 hover:border-green-300 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Batches'
            )}
          </button>
        )}
      </div>
    </aside>
  );
}