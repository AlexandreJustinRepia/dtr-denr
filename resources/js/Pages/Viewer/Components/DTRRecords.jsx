import { Download, Clock, Loader2, User, FileText, Calendar, CheckCircle2 } from "lucide-react";

// Helper functions for shift schedules and flexi time
const getScheduledTimes = (date) => {
    const day = new Date(date).getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    // 10‑hour shift Monday‑Thursday
    if (day >= 1 && day <= 4) {
        return { start: "07:00", end: "18:00" };
    }
    // 8‑hour shift Monday‑Friday (default)
    return { start: "08:00", end: "17:00" };
};

const isFlexiEligible = (checkIn, scheduledStart) => {
    if (!checkIn) return false;
    const [h, m] = checkIn.split(":").map(Number);
    const minutes = h * 60 + m;
    // Flexi window is 07:00‑08:00 and only when scheduled start is 07:00 (10‑hour shift)
    return scheduledStart === "07:00" && minutes >= 420 && minutes < 480;
};

const minutesDiff = (a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return (ah * 60 + am) - (bh * 60 + bm);
};
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
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-20 text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-gray-100">
                    <User className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Matrix Hub</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Select personnel to initialize retrieval</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Personnel Header Card */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden group">
                <div className="bg-gray-50 p-10 flex items-center justify-between relative overflow-hidden border-b border-gray-100">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">Active Session</p>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">
                            {selectedEmployee}
                        </h2>
                    </div>
                    <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hidden sm:flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
                        <Clock size={24} className="text-green-700 mb-1" />
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-none">Records</span>
                    </div>
                    <FileText className="absolute -right-10 -bottom-10 text-green-900/5 rotate-12" size={240} />
                </div>

                <div className="p-10">
                    {dtrLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-500 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                            <Loader2 className="w-12 h-12 animate-spin text-green-700 mb-6" />
                            <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">Synchronizing Matrix Data...</p>
                        </div>
                    ) : records[selectedEmployee] && Object.keys(records[selectedEmployee]).length > 0 ? (
                        Object.entries(records[selectedEmployee]).map(([month, days]) => {
                            const monthKey = month;
                            return (
                                <div key={month} className="mb-12 last:mb-0">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-green-100 p-3 rounded-2xl">
                                                <Calendar className="text-green-700 w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                                                    {month}
                                                </h3>
                                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest leading-none">Daily Attendance Summary</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                                            {/* PDF */}
                                            {downloadLoading[`${selectedEmployee}-${monthKey}`] ? (
                                                <button disabled className="flex-1 sm:flex-none inline-flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-green-500/50 text-white cursor-not-allowed">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching...
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDownload(selectedEmployee, monthKey)}
                                                    className="flex-1 sm:flex-none inline-flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-700/20 active:scale-95"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> PDF
                                                </button>
                                            )}

                                            {/* DOCX */}
                                            {downloadLoading[`${selectedEmployee}-${monthKey}-docx`] ? (
                                                <button disabled className="flex-1 sm:flex-none inline-flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-blue-500/50 text-white cursor-not-allowed">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching...
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDownloadDocx(selectedEmployee, monthKey)}
                                                    className="flex-1 sm:flex-none inline-flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95"
                                                >
                                                    <FileText className="w-3.5 h-3.5" /> DOCX
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-[40px] overflow-hidden border border-gray-100">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead className="bg-white border-b border-gray-100">
                                                    <tr className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">
                                                        <th className="px-8 py-6 text-left selection:bg-green-100">Day</th>
                                                        <th className="px-5 py-6 font-bold">Check In</th>
                                                        <th className="px-5 py-6 font-bold">Break Out</th>
                                                        <th className="px-5 py-6 font-bold">Break In</th>
                                                        <th className="px-5 py-6 font-bold">Check Out</th>
                                                        <th className="px-5 py-6 font-bold">Late</th>
                                                        <th className="px-5 py-6 font-bold">Undertime</th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-white">
                                                    {Object.entries(days).map(([date, data]) => {
                                                        const { inTime, breakOut, breakIn, outTime } = processLogs(data.logs);
                                                        const dayNum = new Date(date).getDate();
                                                        // Calculate scheduled times and flexi eligibility
                                                        const scheduled = getScheduledTimes(date);
                                                        const getFormatTime = (t) => {
                                                            if (!t) return null;
                                                            if (typeof t === 'string' && /^\d{2}:\d{2}/.test(t)) return t.substring(0, 5);
                                                            const d = new Date(t);
                                                            return !isNaN(d.getTime()) ? d.toTimeString().substring(0, 5) : null;
                                                        };
                                                        const actualIn = getFormatTime(inTime);
                                                        const actualOut = getFormatTime(outTime);
                                                        const isValidTime = (t) => t && /^\d{2}:\d{2}$/.test(t);

                                                        let lateMinutes = null;
                                                        let undertimeMinutes = null;

                                                        const formatMins = (mins) => {
                                                            if (!mins) return '';
                                                            const h = Math.floor(mins / 60);
                                                            const m = mins % 60;
                                                            if (h > 0 && m > 0) return `${h} hr ${m} min`;
                                                            if (h > 0) return `${h} hr`;
                                                            return `${m} min`;
                                                        };

                                                        if (isValidTime(actualIn) || isValidTime(actualOut)) {
                                                            const timeToMins = (t) => {
                                                                if (!t) return 0;
                                                                const [h, m] = t.split(':').map(Number);
                                                                return h * 60 + m;
                                                            };

                                                            const inMins = actualIn ? timeToMins(actualIn) : null;
                                                            const outMins = actualOut ? timeToMins(actualOut) : null;
                                                            const schedStartMins = timeToMins(scheduled.start);
                                                            const schedEndMins = timeToMins(scheduled.end);
                                                            const shiftLength = schedEndMins - schedStartMins;

                                                            let effectiveStartMins = schedStartMins;

                                                            // Apply Flexi Time ONLY for the 10-hour shift (07:00 am)
                                                            if (scheduled.start === "07:00" && inMins !== null) {
                                                                if (inMins <= 480) { // Up to 8:00 AM (480 mins)
                                                                    effectiveStartMins = Math.max(schedStartMins, inMins);
                                                                } else {
                                                                    effectiveStartMins = 480; // Max flexi offset is 60 mins
                                                                }
                                                            }

                                                            if (inMins !== null) {
                                                                lateMinutes = Math.max(0, inMins - effectiveStartMins);
                                                            }

                                                            if (outMins !== null) {
                                                                const effectiveEndMins = effectiveStartMins + shiftLength;
                                                                undertimeMinutes = Math.max(0, effectiveEndMins - outMins);
                                                            }
                                                        }

                                                        return (
                                                            <tr key={date} className="hover:bg-white transition-all duration-300 group/tr">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-gray-900 text-[11px] shadow-sm">{dayNum}</span>
                                                                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover/tr:text-green-600 transition-colors">{data.weekday}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-5 text-center">
                                                                    <span className={`font-mono font-black text-xs px-2 py-1 rounded-lg ${inTime ? 'text-green-700 bg-green-50' : 'text-gray-300'}`}>
                                                                        {format12Hour(inTime) || '--:--'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-5 text-center">
                                                                    <span className={`font-mono font-bold text-xs px-2 py-1 rounded-lg ${breakOut ? 'text-orange-700 bg-orange-50/50' : 'text-gray-300'}`}>
                                                                        {format12Hour(breakOut) || '--:--'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-5 text-center">
                                                                    <span className={`font-mono font-bold text-xs px-2 py-1 rounded-lg ${breakIn ? 'text-orange-700 bg-orange-50/50' : 'text-gray-300'}`}>
                                                                        {format12Hour(breakIn) || '--:--'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-5 text-center border-l border-white">
                                                                    <span className={`font-mono font-black text-xs px-2 py-1 rounded-lg ${outTime ? 'text-red-600 bg-red-50' : 'text-gray-300'}`}>
                                                                        {format12Hour(outTime) || '--:--'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-5 text-center">
                                                                    {lateMinutes && lateMinutes > 0 ? formatMins(lateMinutes) : ''}
                                                                </td>
                                                                <td className="px-5 py-5 text-center">
                                                                    {undertimeMinutes && undertimeMinutes > 0 ? formatMins(undertimeMinutes) : ''}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-24 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                            <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-gray-200" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No matrix logs found for the selected period.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
