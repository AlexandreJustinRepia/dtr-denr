import { Download, Clock, Loader2, User } from "lucide-react";

export default function DTRRecords({
    selectedEmployee,
    dtrLoading,
    records,
    downloadLoading,
    handleDownload,
    handleDownloadDocx,
    processLogs,
    format12Hour
}) {
    if (!selectedEmployee) {
        return (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Select an employee to view their Daily Time Record</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-6 outline-none">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-3">
                    <Clock className="w-6 h-6" /> {selectedEmployee}'s DTR
                </h2>
            </div>

            <div className="p-6 max-h-screen overflow-y-auto">
                {dtrLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
                        <p>Loading DTR records...</p>
                    </div>
                ) : records[selectedEmployee] && Object.keys(records[selectedEmployee]).length > 0 ? (
                    Object.entries(records[selectedEmployee]).map(([month, days]) => (
                        <div key={month} className="mb-10 last:mb-0">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-green-700">
                                    {month} — Daily Time Record
                                </h3>

                                <div className="flex gap-2">
                                    {/* PDF */}
                                    {downloadLoading[`${selectedEmployee}-${month}`] ? (
                                        <button disabled className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-green-400 text-white shadow-md text-sm cursor-not-allowed">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDownload(selectedEmployee, month)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition bg-green-600 hover:bg-green-700 text-white shadow-md text-sm"
                                        >
                                            <Download className="w-4 h-4" /> PDF
                                        </button>
                                    )}

                                    {/* DOCX */}
                                    {downloadLoading[`${selectedEmployee}-${month}-docx`] ? (
                                        <button disabled className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-blue-400 text-white shadow-md text-sm cursor-not-allowed">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDownloadDocx(selectedEmployee, month)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition bg-blue-600 hover:bg-blue-700 text-white shadow-md text-sm"
                                        >
                                            <Download className="w-4 h-4" /> DOCX
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-green-50 text-green-800 font-semibold">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Day</th>
                                            <th className="px-4 py-3 text-left">Weekday</th>
                                            <th className="px-4 py-3 text-center">In</th>
                                            <th className="px-4 py-3 text-center">Break Out</th>
                                            <th className="px-4 py-3 text-center">Break In</th>
                                            <th className="px-4 py-3 text-center">Out</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {Object.entries(days).map(([date, data]) => {
                                            const { inTime, breakOut, breakIn, outTime } = processLogs(data.logs);
                                            const dayNum = new Date(date).getDate();

                                            return (
                                                <tr key={date} className="hover:bg-green-50 transition">
                                                    <td className="px-4 py-3 font-medium">{dayNum}</td>
                                                    <td className="px-4 py-3 text-gray-600">{data.weekday}</td>
                                                    <td className="px-4 py-3 text-center font-mono text-green-700">{format12Hour(inTime)}</td>
                                                    <td className="px-4 py-3 text-center font-mono text-orange-600">{format12Hour(breakOut)}</td>
                                                    <td className="px-4 py-3 text-center font-mono text-orange-600">{format12Hour(breakIn)}</td>
                                                    <td className="px-4 py-3 text-center font-mono text-red-600">{format12Hour(outTime)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-12">
                        No attendance records found for {selectedEmployee} in this period.
                    </p>
                )}
            </div>
        </div>
    );
}
