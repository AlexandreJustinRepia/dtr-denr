import { useState, useMemo } from "react";
import { Download, Clock, Loader2, User, FileText, Calendar, CheckCircle2, Trash2, X } from "lucide-react";

// Helper functions for shift schedules and flexi time
const getScheduledTimes = (date, override = null) => {
    if (override === '10HR') return { start: "07:00", end: "18:00", latest: "08:00" };
    if (override === '8HR') return { start: "08:00", end: "17:00", latest: "09:00" };

    const day = new Date(date).getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    // 10‑hour shift Monday‑Thursday
    if (day >= 1 && day <= 4) {
        return { start: "07:00", end: "18:00", latest: "08:00" };
    }
    // 8‑hour shift Friday
    return { start: "08:00", end: "17:00", latest: "09:00" };
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
    updateSchedule,
    updateLogTime,
    createLogTime,
    processLogs,
    format12Hour,
    handleDeleteMonth,
    updateTravelOrder,
    editingTO,
    setEditingTO,
    breaks,
    upsertBreak
}) {
    const [editing, setEditing] = useState(null); // { id, value, type, date }
    const [breakEditing, setBreakEditing] = useState(null); // { date, field, value }
    const [checkoutEditing, setCheckoutEditing] = useState(null); // { date, value }

    const manualBreaksByDate = useMemo(() => {
        const map = {};
        (Object.values(breaks || {})).forEach(b => {
            map[b.log_date] = b;
        });
        return map;
    }, [breaks]);

    if (!selectedEmployee) {
        return (
            <div className="bg-white rounded border border-gray-200 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Employee Records</h3>
                <p className="text-sm text-gray-500">Select an employee to view their Daily Time Record</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Personnel Header Card */}
            <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-6 md:p-8 flex items-center justify-between border-b border-gray-200">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">DTR Record</p>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {selectedEmployee}
                        </h2>
                    </div>
                    <div className="hidden sm:flex flex-col items-center bg-white p-3 rounded shadow-sm border border-gray-200">
                        <Clock size={20} className="text-green-700 mb-1" />
                        <span className="text-xs font-medium text-gray-600">Records</span>
                    </div>
                </div>

                <div className="p-6">
                    {dtrLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-200">
                            <Loader2 className="w-8 h-8 animate-spin text-green-700 mb-4" />
                            <p className="text-sm text-gray-500">Loading records...</p>
                        </div>
                    ) : records[selectedEmployee] && Object.keys(records[selectedEmployee]).length > 0 ? (
                        Object.entries(records[selectedEmployee]).map(([month, days]) => {
                            const monthKey = month;
                            return (
                                <div key={month} className="mb-12 last:mb-0">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded">
                                                <Calendar className="text-green-800 w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {month}
                                                </h3>
                                                <p className="text-sm text-gray-500 leading-none">Monthly Attendance</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                                            {/* PDF */}
                                            {downloadLoading[`${selectedEmployee}-${monthKey}`] ? (
                                                <button disabled className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium bg-green-600/50 text-white cursor-not-allowed">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching...
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDownload(selectedEmployee, monthKey)}
                                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors bg-green-700 hover:bg-green-800 text-white"
                                                >
                                                    <Download className="w-4 h-4" /> PDF
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDeleteMonth(selectedEmployee, monthKey)}
                                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors bg-white text-red-600 hover:bg-red-50 border border-red-200"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>

                                            {/* DOCX */}
                                            {downloadLoading[`${selectedEmployee}-${monthKey}-docx`] ? (
                                                <button disabled className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium bg-blue-500/50 text-white cursor-not-allowed">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching...
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDownloadDocx(selectedEmployee, monthKey)}
                                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <FileText className="w-4 h-4" /> DOCX
                                                </button>
                                            )}
                                            
                                        </div>
                                    </div>

                                    <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr className="text-xs font-semibold text-gray-600 uppercase">
                                                        <th className="px-4 py-3 w-32">Day</th>
                                                        <th className="px-4 py-3 text-center">Check In</th>
                                                        <th className="px-4 py-3 text-center">Break Out</th>
                                                        <th className="px-4 py-3 text-center">Break In</th>
                                                        <th className="px-4 py-3 text-center">Check Out</th>
                                                        <th className="px-4 py-3 text-center">Late</th>
                                                        <th className="px-4 py-3 text-center">Undertime</th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-gray-200">
                                                    {Object.entries(days).map(([date, data]) => {
                                                        const { inTime, breakOut, breakIn, outTime } = processLogs(data.logs);
                                                        const manualBreak = manualBreaksByDate[date] || null;
                                                        const manualBreakOut = manualBreak?.break_out_time ? { id: 'break-out-' + date, time: manualBreak.break_out_time } : breakOut;
                                                        const manualBreakIn = manualBreak?.break_in_time ? { id: 'break-in-' + date, time: manualBreak.break_in_time } : breakIn;
                                                        const dayNum = new Date(date).getDate();
                                                        // Calculate scheduled times and flexi eligibility 
                                                        const scheduled = getScheduledTimes(date, data.schedule_type);
                                                        const actualIn = inTime ? inTime.time : null;
                                                        const actualOut = outTime ? outTime.time : null;
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

                                                          if (data.late_minutes) {
                                                              lateMinutes = data.late_minutes;
                                                          }
                                                          if (data.undertime_minutes) {
                                                              undertimeMinutes = data.undertime_minutes;
                                                          }

                                                          if (!data.late_minutes && !data.undertime_minutes) {
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
                                                                  const latestStartMins = timeToMins(scheduled.latest);
                                                                  const shiftLength = schedEndMins - schedStartMins;

                                                                  if (inMins !== null && outMins !== null) {
                                                                      const late = Math.max(0, inMins - latestStartMins);
                                                                      if (late > 0) lateMinutes = late;

                                                                      const earliestStart = (scheduled.start === "07:00") ? 420 : 360;
                                                                      const effectiveStartMins = Math.max(earliestStart, inMins);

                                                                      const requiredEndMins = effectiveStartMins + shiftLength;
                                                                      const undertime = Math.max(0, requiredEndMins - outMins);
                                                                      if (undertime > 0) {
                                                                          lateMinutes = (lateMinutes || 0) + undertime;
                                                                      }
                                                                  }
                                                              }
                                                          }

                                                        return (
                                                            <tr key={date} className="hover:bg-gray-50 transition-colors group">
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-semibold text-gray-900 w-5">{dayNum}</span>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-gray-500 font-medium group-hover:text-green-700 transition-colors">{data.weekday}</span>
                                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                                <button 
                                                                                    onClick={() => updateSchedule(selectedEmployee, date, data.schedule_type === '10HR' ? '8HR' : '10HR')}
                                                                                    title="Change Schedule"
                                                                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded border transition-colors w-fit ${
                                                                                        data.schedule_type === '10HR' 
                                                                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                                                                            : data.schedule_type === '8HR'
                                                                                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                                                    }`}
                                                                                >
                                                                                    {data.schedule_type === '10HR' ? '10H' : data.schedule_type === '8HR' ? '8H' : 'Auto'}
                                                                                </button>
                                                                                {!data.travel_order && (
                                                                                    <button 
                                                                                        onClick={() => setEditingTO({ date, value: '' })}
                                                                                        title="Set Travel Order"
                                                                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                                                                                    >
                                                                                        TO
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                {data.travel_order || (editingTO && editingTO.date === date) ? (
                                                                    <td colSpan="4" className="px-4 py-3 text-center bg-yellow-50/30">
                                                                        {editingTO && editingTO.date === date ? (
                                                                            <div className="flex items-center justify-center gap-2">
                                                                                <span className="text-xs font-bold text-yellow-700">TO:</span>
                                                                                <input
                                                                                    autoFocus
                                                                                    type="text"
                                                                                    placeholder="Enter TO Number..."
                                                                                    value={editingTO.value}
                                                                                    onChange={(e) => setEditingTO({ ...editingTO, value: e.target.value })}
                                                                                    onBlur={async () => {
                                                                                        if (editingTO.value === data.travel_order) {
                                                                                            setEditingTO(null);
                                                                                            return;
                                                                                        }
                                                                                        const success = await updateTravelOrder(selectedEmployee, editingTO.date, editingTO.value, data.logs?.length > 0);
                                                                                        if (success) setEditingTO(null);
                                                                                    }}
                                                                                    onKeyDown={async (e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            const success = await updateTravelOrder(selectedEmployee, editingTO.date, editingTO.value, data.logs?.length > 0);
                                                                                            if (success) setEditingTO(null);
                                                                                        }
                                                                                        if (e.key === 'Escape') setEditingTO(null);
                                                                                    }}
                                                                                    className="font-bold text-sm px-3 py-1 rounded border border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none w-48 text-center bg-white shadow-sm"
                                                                                />
                                                                                <button 
                                                                                    onClick={() => setEditingTO(null)}
                                                                                    className="p-1 hover:bg-yellow-100 rounded text-yellow-700 transition-colors"
                                                                                    title="Cancel"
                                                                                >
                                                                                    <X size={16} />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center justify-center gap-2">
                                                                                <span 
                                                                                    onClick={() => setEditingTO({ date, value: data.travel_order })}
                                                                                    className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-xs font-bold border border-yellow-200 cursor-pointer hover:bg-yellow-200 transition-colors uppercase tracking-wider"
                                                                                >
                                                                                    <FileText size={14} />
                                                                                    Travel Order: {data.travel_order}
                                                                                </span>
                                                                                <button 
                                                                                    onClick={() => updateTravelOrder(selectedEmployee, date, null)}
                                                                                    className="p-1.5 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                                                                                    title="Remove Travel Order"
                                                                                >
                                                                                    <X size={14} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                ) : (
                                                                    <>
                                                                        <td className="px-4 py-3 text-center">
                                                                            {editing && editing.id === inTime?.id ? (
                                                                                <input
                                                                                    autoFocus
                                                                                    type="time"
                                                                                    value={editing.value}
                                                                                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                                                                    onBlur={() => {
                                                                                        updateLogTime(editing.id, editing.value, selectedEmployee);
                                                                                        setEditing(null);
                                                                                    }}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            updateLogTime(editing.id, editing.value, selectedEmployee);
                                                                                            setEditing(null);
                                                                                        }
                                                                                        if (e.key === 'Escape') setEditing(null);
                                                                                    }}
                                                                                    className="font-medium text-sm px-2 py-1 rounded border border-green-500 focus:ring-1 focus:ring-green-500 outline-none w-24 text-center"
                                                                                />
                                                                            ) : (
                                                                                <span 
                                                                                    onClick={() => {
                                                                                        if (inTime) setEditing({ id: inTime.id, value: inTime.time });
                                                                                        else setEditingTO({ date, value: '' });
                                                                                    }}
                                                                                    className={`font-medium text-sm transition-colors cursor-pointer block ${inTime ? 'text-gray-900 hover:text-green-700 hover:underline' : 'text-gray-300 hover:text-gray-500'}`}>
                                                                                    {format12Hour(inTime) || '--:--'}
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                          <td className="px-4 py-3 text-center">
                                                                              {breakEditing && breakEditing.date === date && breakEditing.field === 'break_out_time' ? (
                                                                                  <input
                                                                                      autoFocus
                                                                                      type="time"
                                                                                      value={breakEditing.value}
                                                                                      onChange={(e) => setBreakEditing({ ...breakEditing, value: e.target.value })}
                                                                                      onBlur={async () => {
                                                                                          const success = await upsertBreak(selectedEmployee, date, 'break_out_time', breakEditing.value);
                                                                                          if (success) setBreakEditing(null);
                                                                                      }}
                                                                                      onKeyDown={async (e) => {
                                                                                          if (e.key === 'Enter') {
                                                                                              const success = await upsertBreak(selectedEmployee, date, 'break_out_time', breakEditing.value);
                                                                                              if (success) setBreakEditing(null);
                                                                                          }
                                                                                          if (e.key === 'Escape') setBreakEditing(null);
                                                                                      }}
                                                                                      className="font-medium text-sm px-2 py-1 rounded border border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none w-24 text-center"
                                                                                  />
                                                                              ) : inTime ? (
                                                                                  <span
                                                                                      onDoubleClick={() => setBreakEditing({ date, field: 'break_out_time', value: manualBreakOut?.time || breakOut?.time || '' })}
                                                                                      className={`font-medium text-sm transition-colors cursor-pointer block ${manualBreakOut ? 'text-gray-900 hover:text-orange-600 hover:underline' : 'text-gray-400'}`}>
                                                                                      {format12Hour(manualBreakOut) || '--:--'}
                                                                                  </span>
                                                                              ) : (
                                                                                  <span className="font-medium text-sm text-gray-300 block">--:--</span>
                                                                              )}
                                                                          </td>
                                                                          <td className="px-4 py-3 text-center">
                                                                              {breakEditing && breakEditing.date === date && breakEditing.field === 'break_in_time' ? (
                                                                                  <input
                                                                                      autoFocus
                                                                                      type="time"
                                                                                      value={breakEditing.value}
                                                                                      onChange={(e) => setBreakEditing({ ...breakEditing, value: e.target.value })}
                                                                                      onBlur={async () => {
                                                                                          const success = await upsertBreak(selectedEmployee, date, 'break_in_time', breakEditing.value);
                                                                                          if (success) setBreakEditing(null);
                                                                                      }}
                                                                                      onKeyDown={async (e) => {
                                                                                          if (e.key === 'Enter') {
                                                                                              const success = await upsertBreak(selectedEmployee, date, 'break_in_time', breakEditing.value);
                                                                                              if (success) setBreakEditing(null);
                                                                                          }
                                                                                          if (e.key === 'Escape') setBreakEditing(null);
                                                                                      }}
                                                                                      className="font-medium text-sm px-2 py-1 rounded border border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none w-24 text-center"
                                                                                  />
                                                                              ) : inTime ? (
                                                                                  <span
                                                                                      onDoubleClick={() => setBreakEditing({ date, field: 'break_in_time', value: manualBreakIn?.time || breakIn?.time || '' })}
                                                                                      className={`font-medium text-sm transition-colors cursor-pointer block ${manualBreakIn ? 'text-gray-900 hover:text-orange-600 hover:underline' : 'text-gray-400'}`}>
                                                                                      {format12Hour(manualBreakIn) || '--:--'}
                                                                                  </span>
                                                                              ) : (
                                                                                  <span className="font-medium text-sm text-gray-300 block">--:--</span>
                                                                              )}
                                                                          </td>
                                                                         <td className="px-4 py-3 text-center border-l border-gray-100">
                                                                             {checkoutEditing && checkoutEditing.date === date ? (
                                                                                 <input
                                                                                     autoFocus
                                                                                     type="time"
                                                                                     value={checkoutEditing.value}
                                                                                     onChange={(e) => setCheckoutEditing({ ...checkoutEditing, value: e.target.value })}
                                                                                     onBlur={() => {
                                                                                         if (checkoutEditing.value) {
                                                                                             createLogTime(selectedEmployee, date, checkoutEditing.value);
                                                                                         }
                                                                                         setCheckoutEditing(null);
                                                                                     }}
                                                                                     onKeyDown={(e) => {
                                                                                         if (e.key === 'Enter') {
                                                                                             if (checkoutEditing.value) {
                                                                                                 createLogTime(selectedEmployee, date, checkoutEditing.value);
                                                                                             }
                                                                                             setCheckoutEditing(null);
                                                                                         }
                                                                                         if (e.key === 'Escape') setCheckoutEditing(null);
                                                                                     }}
                                                                                     className="font-medium text-sm px-2 py-1 rounded border border-red-500 focus:ring-1 focus:ring-red-500 outline-none w-24 text-center"
                                                                                 />
                                                                             ) : editing && editing.id === outTime?.id ? (
                                                                                 <input
                                                                                     autoFocus
                                                                                     type="time"
                                                                                     value={editing.value}
                                                                                     onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                                                                     onBlur={() => {
                                                                                         updateLogTime(editing.id, editing.value, selectedEmployee);
                                                                                         setEditing(null);
                                                                                     }}
                                                                                     onKeyDown={(e) => {
                                                                                         if (e.key === 'Enter') {
                                                                                             updateLogTime(editing.id, editing.value, selectedEmployee);
                                                                                             setEditing(null);
                                                                                         }
                                                                                         if (e.key === 'Escape') setEditing(null);
                                                                                     }}
                                                                                     className="font-medium text-sm px-2 py-1 rounded border border-red-500 focus:ring-1 focus:ring-red-500 outline-none w-24 text-center"
                                                                                 />
                                                                              ) : (
                                                                                  <span 
                                                                                      onClick={() => {
                                                                                          if (outTime) {
                                                                                              setEditing({ id: outTime.id, value: outTime.time });
                                                                                          } else if (inTime) {
                                                                                              setCheckoutEditing({ date, value: '' });
                                                                                          }
                                                                                      }}
                                                                                      className={`font-medium text-sm transition-colors cursor-pointer block ${outTime ? 'text-gray-900 hover:text-red-600 hover:underline' : inTime ? 'text-gray-400 hover:text-gray-500' : 'text-gray-300 cursor-default'}`}>
                                                                                      {format12Hour(outTime) || '--:--'}
                                                                                  </span>
                                                                              )}
                                                                         </td>
                                                                    </>
                                                                )}
                                                                <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                                                                    {lateMinutes && lateMinutes > 0 ? formatMins(lateMinutes) : ''}
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">
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
                        <div className="text-center py-16 bg-gray-50 rounded border border-dashed border-gray-200">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-sm text-gray-500">No records found for this month.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
