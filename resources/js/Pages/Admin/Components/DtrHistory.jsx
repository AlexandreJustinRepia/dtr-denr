import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { DownloadIcon, RefreshCwIcon } from 'lucide-react';

export default function DTRHistory({ onReprocess, refreshSignal }) {
  const [batches, setBatches] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadHistory = async (p = 1) => {
    try {
      const { data } = await axios.get('/admin/dtr/history', { params: { page: p } });
      if (p === 1) setBatches(data.data);
      else setBatches(prev => [...prev, ...data.data]);
      setHasMore(data.current_page < data.last_page);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  // Initial load + refresh when signal changes
  useEffect(() => {
    loadHistory(1);
  }, [refreshSignal]);

  return (
    <aside className="lg:col-span-1">
      <h2 className="text-xl font-semibold mb-3 flex items-center">
        Upload History
      </h2>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
        {batches.map(b => (
          <div
            key={b.id}
            className="flex items-center justify-between p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{b.batch_name}</p>
              <p className="text-xs text-gray-600">
                {format(new Date(b.uploaded_at), 'PPp')} • {b.record_count} logs
              </p>
            </div>
            <div className="flex gap-1 ml-2">
              <button
                onClick={() => onReprocess(b.id)}
                title="Load raw log"
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              >
                <RefreshCwIcon className="w-5 h-5" />
              </button>
              <a
                href={`/admin/dtr/batch/${b.id}/download`}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Download parsed JSON"
              >
                <DownloadIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => {
            const next = page + 1;
            setPage(next);
            loadHistory(next);
          }}
          className="mt-3 w-full text-center text-sm text-blue-600 hover:underline"
        >
          Load more…
        </button>
      )}
    </aside>
  );
}

