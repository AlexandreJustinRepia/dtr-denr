import { Head } from '@inertiajs/react';

export default function DTRLanding({ records }) {
const processLogs = (logs) => {
    const sorted = logs.map((l) => l.time).sort();
    let inTime = '', breakOut = '', breakIn = '', outTime = '';

    sorted.forEach((time) => {
    const [h] = time.split(':').map(Number);
    if (h >= 5 && h < 12 && !inTime) inTime = time;
    else if (h >= 12 && h < 13 && !breakOut) breakOut = time;
    else if (h >= 12 && h < 14 && breakOut && !breakIn) breakIn = time;
    else if (h >= 13 && h <= 22) outTime = time;
    });

    return { inTime, breakOut, breakIn, outTime };
};

return (
    <div className="max-w-6xl mx-auto p-6">
    <Head title="Employee DTR View" />
    <h1 className="text-2xl font-bold mb-4">Employee DTR Viewer</h1>

    {!records || Object.keys(records).length === 0 ? (
        <p className="text-gray-600">No DTR available yet.</p>
    ) : (
        Object.entries(records).map(([employee, months]) => (
        <div key={employee} className="border rounded-lg mb-6 bg-white shadow">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg">
            <h2 className="text-lg font-semibold">{employee}</h2>
            </div>

            <div className="p-4">
            {Object.entries(months).map(([month, days]) => (
                <div key={month} className="mb-6">
                <h3 className="text-blue-700 font-medium mb-3">
                    {month} — Daily Time Record
                </h3>

                <a
                    href={`/generate-dtr/${encodeURIComponent(employee)}/2025-10`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                    Download DTR (DOCX)
                </a>

                <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                    <thead className="bg-blue-100 text-blue-800">
                        <tr>
                        <th className="border px-3 py-2">Day</th>
                        <th className="border px-3 py-2">Weekday</th>
                        <th className="border px-3 py-2">Check In</th>
                        <th className="border px-3 py-2">Break Out</th>
                        <th className="border px-3 py-2">Break In</th>
                        <th className="border px-3 py-2">Check Out</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(days).map(([date, data]) => {
                        const { inTime, breakOut, breakIn, outTime } = processLogs(data.logs);
                        const dayNum = new Date(date).getDate();
                        return (
                            <tr key={date} className="even:bg-gray-50 text-center">
                            <td className="border px-3 py-2 font-semibold text-gray-700">{dayNum}</td>
                            <td className="border px-3 py-2 text-gray-600">{data.weekday}</td>
                            <td className="border px-3 py-2">{inTime}</td>
                            <td className="border px-3 py-2">{breakOut}</td>
                            <td className="border px-3 py-2">{breakIn}</td>
                            <td className="border px-3 py-2">{outTime}</td>
                            </tr>
                        );
                        })}
                    </tbody>
                    </table>
                </div>
                </div>
            ))}
            </div>
        </div>
        ))
    )}
    </div>
);
}
