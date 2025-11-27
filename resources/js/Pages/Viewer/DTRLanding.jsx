import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Download, User, Clock, AlertCircle, Building2, Loader2 } from 'lucide-react';
import Footer from '@/Components/Footer';
import SearchFilters from './Components/SearchFilter';
import EmployeeList from './Components/EmployeeList';
import axios from 'axios';

export default function DTRLanding({ employees, filters, availableDates }) {
    const dtrRef = useRef(null);
    const dtrContentRef = useRef(null);

    const today = new Date();
    const currentMonth = filters?.month || today.getMonth() + 1;
    const currentYear = filters?.year || today.getFullYear();

    const [search, setSearch] = useState(filters?.search || '');
    const [filterMonth, setFilterMonth] = useState(currentMonth);
    const [filterYear, setFilterYear] = useState(currentYear);
    const [status, setStatus] = useState(filters?.status || '');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [records, setRecords] = useState({});
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [dtrLoading, setDtrLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState({});

    const employeeList = employees.data;

    // Handle selecting an employee to view DTR
    const handleEmployeeSelect = async (employeeName) => {
        setSelectedEmployee(employeeName);
        setDtrLoading(true);
        try {
            const res = await axios.get(`/fetch-dtr/${encodeURIComponent(employeeName)}/${filterMonth}/${filterYear}?status=${status}`);
            setRecords({ [employeeName]: res.data.records });
        } catch (err) {
            console.error(err);
            alert('Failed to load DTR.');
        } finally {
            setDtrLoading(false);
        }
    };

    // Handle PDF download
    const handleDownload = async (employeeName, month) => {
        const key = `${employeeName}-${month}`;
        setDownloadLoading(prev => ({ ...prev, [key]: true }));

        try {
            const response = await fetch(`/generate-dtr/${encodeURIComponent(employeeName)}/${month}`, {
                method: 'GET',
                headers: { 'Accept': 'application/pdf' },
            });
            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${employeeName.replace(/ /g, '_')}_DTR_${month}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error(error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloadLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    // Convert 24-hour time to 12-hour format
    const format12Hour = (time) => {
        if (!time) return '';
        let [hour, minute] = time.split(':').map(Number);
        hour = hour % 12 || 12;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    // Process raw logs into in/out/break times
    const processLogs = (logs) => {
        if (!logs || logs.length === 0) return { inTime: '', breakOut: '', breakIn: '', outTime: '' };
        const times = logs.map(l => l.time).sort();
        let inTime = '', breakOut = '', breakIn = '', outTime = '';

        times.forEach(time => {
            const [h, m] = time.split(':').map(Number);
            const hm = h + m / 60;
            if (hm >= 5 && hm < 12 && !inTime) inTime = time;
            if (hm >= 12 && hm < 13 && !breakOut) breakOut = time;
            if (breakOut && hm >= 12 && hm < 14 && !breakIn && time !== breakOut) breakIn = time;
            if (hm >= 13) outTime = time;
        });

        return { inTime, breakOut, breakIn, outTime };
    };

    // Perform search/filter requests
    const performRequest = ({ searchValue, monthValue, yearValue, statusValue, updateList = true }) => {
        if (updateList) setLoadingEmployees(true);
        else setDtrLoading(true);

        router.get(
            route('dtr.view'),
            { search: searchValue || '', month: monthValue, year: yearValue, status: statusValue },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => {
                    if (updateList) setLoadingEmployees(false);
                    else setDtrLoading(false);
                },
            }
        );
    };

    // Auto-fetch when filters change
    useEffect(() => {
        if (selectedEmployee) {
            handleEmployeeSelect(selectedEmployee);
        } else {
            performRequest({
                searchValue: search,
                monthValue: filterMonth,
                yearValue: filterYear,
                statusValue: status,
                updateList: true
            });
        }
    }, [filterMonth, filterYear, status]);

    const handleSearch = () => performRequest({ searchValue: search, monthValue: filterMonth, yearValue: filterYear, statusValue: status });
    const handleKeyDown = (e) => e.key === 'Enter' && handleSearch();
    const handleReset = () => {
        setSearch(''); setFilterMonth(currentMonth); setFilterYear(currentYear); setStatus(''); setSelectedEmployee(null);
        performRequest({ searchValue: '', monthValue: currentMonth, yearValue: currentYear, statusValue: '', updateList: true });
    };

    return (
        <>
            <Head title="PENRO Bulacan DTR PORTAL" />

            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-900 text-white py-8 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="bg-white p-3 rounded-full shadow-md">
                            <Building2 className="w-8 h-8 text-green-700" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">PENRO Bulacan</h1>
                            <p className="text-green-100 text-sm">Department of Environment and Natural Resources</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-green-100">Daily Time Record (DTR) Portal</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                <SearchFilters
                    search={search} setSearch={setSearch}
                    filterMonth={filterMonth} setFilterMonth={setFilterMonth}
                    filterYear={filterYear} setFilterYear={setFilterYear}
                    availableDates={availableDates}
                    handleKeyDown={handleKeyDown} handleSearch={handleSearch} handleReset={handleReset}
                    selectedEmployee={selectedEmployee} performRequest={performRequest}
                    status={status} setStatus={setStatus} loadingEmployees={loadingEmployees}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <EmployeeList
                        employeeList={employeeList}
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={handleEmployeeSelect}
                        employees={employees}
                        search={search}
                        filterMonth={filterMonth}
                        filterYear={filterYear}
                        router={router}
                        status={status}
                        loadingEmployees={loadingEmployees}
                    />

                    <div className="lg:col-span-2">
                        {selectedEmployee ? (
                            <div ref={dtrRef} tabIndex="-1" className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-6 outline-none">
                                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5 flex justify-between items-center">
                                    <h2 className="text-xl font-bold flex items-center gap-3"><Clock className="w-6 h-6" /> {selectedEmployee}'s DTR</h2>
                                </div>

                                <div ref={dtrContentRef} className="p-6 max-h-screen overflow-y-auto">
                                    {dtrLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                            <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
                                            <p>Loading DTR records...</p>
                                        </div>
                                    ) : records[selectedEmployee] && Object.keys(records[selectedEmployee]).length > 0 ? (
                                        Object.entries(records[selectedEmployee]).map(([month, days]) => (
                                            <div key={month} className="mb-10 last:mb-0">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-semibold text-green-700">{month} — Daily Time Record</h3>
                                                    {downloadLoading[`${selectedEmployee}-${month}`] ? (
                                                        <button disabled className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-green-400 text-white shadow-md text-sm cursor-not-allowed">
                                                            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleDownload(selectedEmployee, month)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition bg-green-600 hover:bg-green-700 text-white shadow-md text-sm">
                                                            <Download className="w-4 h-4" /> PDF
                                                        </button>
                                                    )}
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
                                        <p className="text-center text-gray-500 py-12">No attendance records found for {selectedEmployee} in this period.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
                                <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg">Select an employee to view their Daily Time Record</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
