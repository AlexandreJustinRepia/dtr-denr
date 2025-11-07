import { useState } from 'react';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DTRPage() {
  const [logText, setLogText] = useState('');
  const [records, setRecords] = useState(null);

  const generate = async (e) => {
    e.preventDefault();
    const { data } = await axios.post(route('admin.dtr.generate'), { logText });
    setRecords(data.records);
  };

  return (
    <AuthenticatedLayout>
    <div className="max-w-5xl mx-auto p-6">
      <Head title="Admin DTR Generator" />
      <h1 className="text-2xl font-bold mb-4">Admin DTR Generator</h1>

      <form onSubmit={generate}>
        <textarea
          className="w-full p-3 border rounded-md font-mono text-sm"
          rows="8"
          placeholder="Paste attendance logs here..."
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-2"
        >
          Generate DTR
        </button>
      </form>

      {records && (
        <div className="mt-6">
          {Object.entries(records).map(([name, months]) => (
            <div key={name} className="border rounded-md p-4 mb-4 bg-white shadow">
              <h2 className="text-lg font-semibold text-blue-700">{name}</h2>
              {Object.entries(months).map(([monthKey, monthGroup]) => (
                <div key={monthKey} className="mt-3">
                  <h3 className="font-medium">{monthKey}</h3>
                  <pre className="bg-gray-100 p-2 rounded text-xs">
                    {JSON.stringify(monthGroup, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
    </AuthenticatedLayout>
  );
}
