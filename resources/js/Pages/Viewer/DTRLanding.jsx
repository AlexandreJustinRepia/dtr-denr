import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Download, User, Clock, AlertCircle, Building2, Loader2 } from 'lucide-react';
import Footer from '@/Components/Footer';
import SearchFilters from './Components/SearchFilter';

export default function DTRLanding({ records, employees, filters, availableDates }) {
    const dtrRef = useRef(null);
    const dtrContentRef = useRef(null); // For scrolling content to top

    const today = new Date();
    const currentMonth = filters?.month || today.getMonth() + 1;
    const currentYear = filters?.year || today.getFullYear();
    const employeeList = Array.isArray(employees.data) ? employees.data : [];

    const [search, setSearch] = useState(filters?.search || '');
    const [filterMonth, setFilterMonth] = useState(currentMonth);
    const [filterYear, setFilterYear] = useState(currentYear);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dtrLoading, setDtrLoading] = useState(false); // New: DTR-specific loading
    const [downloadLoading, setDownloadLoading] = useState({});

    const format12Hour = (time) => {
        if (!time) return '';
        let [hour, minute] = time.split(':').map(Number);
        hour = hour % 12 || 12; // Convert 0-23 hour to 12-hour (0 becomes 12)
        return `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;
    };

    const handleDownload = async (employeeName, month) => {
        const key = `${employeeName}-${month}`;
        setDownloadLoading(prev => ({ ...prev, [key]: true }));

        try {
            const response = await fetch(`/generate-dtr/${encodeURIComponent(employeeName)}/${month}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                },
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
            alert('Failed to generate PDF. Please try again.');
            console.error(error);
        } finally {
            setDownloadLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    // Reset selected employee if not in current list
    useEffect(() => {
        if (selectedEmployee && !employeeList.some(emp => emp.employee_name === selectedEmployee)) {
            setSelectedEmployee(null);
        }
    }, [employeeList, selectedEmployee]);

    // Auto-scroll + scroll content to top when employee changes
    useEffect(() => {
        if (selectedEmployee && dtrRef.current) {
            // 1. Scroll the entire DTR card into view
            dtrRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });

            // 2. Scroll the inner content to top (after small delay for render)
            setTimeout(() => {
                if (dtrContentRef.current) {
                    dtrContentRef.current.scrollTop = 0;
                }
            }, 300);
        }
    }, [selectedEmployee]);

    const performRequest = ({ searchValue, monthValue, yearValue, updateList = true }) => {
        if (updateList) {
            setLoading(true); // show loader for list + DTR
        } else {
            setDtrLoading(true); // show loader only for DTR
        }

        router.get(
            route('dtr.view'),
            { search: searchValue || '', month: monthValue, year: yearValue },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => {
                    if (updateList) setLoading(false);
                    if (!updateList) setDtrLoading(false);
                },
            }
        );
    };

    const processLogs = (logs) => {
        if (!logs || logs.length === 0) return { inTime: '', breakOut: '', breakIn: '', outTime: '' };

        const times = logs.map(l => l.time).sort();
        let inTime = '', breakOut = '', breakIn = '', outTime = '';

        times.forEach(time => {
            const [h, m] = time.split(':').map(Number);
            const hm = h + m / 60;

            // Check-in: first log before 12
            if (hm >= 5 && hm < 12 && !inTime) inTime = time;

            // Break out: first log between 12:00-12:59
            if (hm >= 12 && hm < 13 && !breakOut) breakOut = time;

            // Break in: first log after break out but before 14:00
            if (breakOut && hm >= 12 && hm < 14 && !breakIn && time !== breakOut) breakIn = time;

            // Check-out: last log after 13:00
            if (hm >= 13) outTime = time;
        });

        return { inTime, breakOut, breakIn, outTime };
    };

    const handleSearch = () => {
        performRequest({ searchValue: search, monthValue: filterMonth, yearValue: filterYear });
    };

    const handleKeyDown = (e) => e.key === 'Enter' && handleSearch();

    const handleReset = () => {
        setSearch('');
        setFilterMonth(currentMonth);
        setFilterYear(currentYear);
        setSelectedEmployee(null);
        performRequest({ searchValue: '', monthValue: currentMonth, yearValue: currentYear });
    };

    const hasRecords = Object.keys(records).length > 0;

    return (
        <>
            <Head title="PENRO Bulacan DTR Generator" />

            {/* Hero Header */}
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

            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                <SearchFilters
                    search={search}
                    setSearch={setSearch}
                    filterMonth={filterMonth}
                    setFilterMonth={setFilterMonth}
                    filterYear={filterYear}
                    setFilterYear={setFilterYear}
                    availableDates={availableDates}
                    handleKeyDown={handleKeyDown}
                    handleSearch={handleSearch}
                    handleReset={handleReset}
                    selectedEmployee={selectedEmployee}
                    performRequest={performRequest}
                />

                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">
                        DTRs are uploaded after <strong>12:59 PM</strong> on the <strong>last workday of each month</strong>.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Employee List */}
                        <div className="lg:col-span-1">
                            {hasRecords && employeeList.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                        <User className="w-5 h-5 text-green-600" /> Select Employee
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                                        {employeeList.map((emp) => (
                                            <button
                                                key={emp.employee_name}
                                                onClick={() => setSelectedEmployee(emp.employee_name)}
                                                className={`p-4 rounded-lg border-2 text-left transition-all shadow-sm hover:shadow-md ${
                                                    selectedEmployee === emp.employee_name
                                                        ? 'border-green-600 bg-green-50 text-green-800 font-semibold ring-2 ring-green-200'
                                                        : 'border-gray-200 bg-white hover:border-green-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        selectedEmployee === emp.employee_name ? 'bg-green-600' : 'bg-green-400'
                                                    }`}></div>
                                                    <span className="truncate text-sm">{emp.employee_name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {employees?.last_page > 1 && (
                                        <div className="flex justify-center gap-2 mt-6 flex-wrap">
                                            {Array.from({ length: employees.last_page }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => {
                                                        setSelectedEmployee(null);
                                                        router.get(route('dtr.view'), {
                                                            page, search, month: filterMonth, year: filterYear
                                                        }, { preserveState: true });
                                                    }}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                                        employees.current_page === page
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-gray-200">
                                    No employees found for the selected period.
                                </div>
                            )}
                        </div>

                        {/* Right: DTR Panel */}
                        <div className="lg:col-span-2">
                            {selectedEmployee ? (
                                <div
                                    ref={dtrRef}
                                    tabIndex="-1"
                                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-6 outline-none"
                                >
                                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5 flex justify-between items-center">
                                        <h2 className="text-xl font-bold flex items-center gap-3">
                                            <Clock className="w-6 h-6" /> {selectedEmployee}'s DTR
                                        </h2>
                                    </div>

                                    {/* Scrollable Content Area */}
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
                                                        <h3 className="text-lg font-semibold text-green-700">
                                                            {month} — Daily Time Record
                                                        </h3>
                                                        {downloadLoading[`${selectedEmployee}-${month}`] ? (
                                                            <button
                                                                disabled
                                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-green-400 text-white shadow-md text-sm cursor-not-allowed"
                                                            >
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
                            ) : (
                                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
                                    <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg">Select an employee to view their Daily Time Record</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}