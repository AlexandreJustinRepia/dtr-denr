import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Search, CalendarFold, Download, User, Clock, AlertCircle, Building2, Calendar1 } from 'lucide-react';

export default function DTRLanding({ records, employees, filters, availableDates }) {
    const today = new Date();
    const currentMonth = filters?.month || today.getMonth() + 1;
    const currentYear = filters?.year || today.getFullYear();
    const employeeList = Array.isArray(employees.data) ? employees.data : [];

    const [search, setSearch] = useState(filters?.search || '');
    const [filterMonth, setFilterMonth] = useState(currentMonth);
    const [filterYear, setFilterYear] = useState(currentYear);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedEmployee && !employeeList.some(emp => emp.employee_name === selectedEmployee)) {
            setSelectedEmployee(null);
        }
    }, [employeeList]);

    const performRequest = ({ searchValue, monthValue, yearValue, selected = null }) => {
        if (!searchValue && !selected) {
            setLoading(false);
            return;
        }
        setLoading(true);
        router.get(
            route('dtr.view'),
            { search: selected ?? searchValue, month: monthValue, year: yearValue },
            { preserveState: true, onFinish: () => setLoading(false) }
        );
    };

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

    const cutoffTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 59);
    const isDTRAvailable = today >= cutoffTime;

    const handleSearch = (selected = null) => {
        if (!search.trim() && !selected) return;
        performRequest({ searchValue: search, monthValue: filterMonth, yearValue: filterYear, selected });
    };

    const handleKeyDown = (e) => e.key === 'Enter' && handleSearch();

    const handleFilterChange = (setter, type) => (e) => {
        const newValue = Number(e.target.value);
        const newMonth = type === 'month' ? newValue : filterMonth;
        const newYear = type === 'year' ? newValue : filterYear;
        setter(newValue);

        if (selectedEmployee) {
            performRequest({ searchValue: search, monthValue: newMonth, yearValue: newYear, selected: selectedEmployee });
        } else if (search.trim()) {
            performRequest({ searchValue: search, monthValue: newMonth, yearValue: newYear });
        }
    };

    const handleReset = () => {
        setSearch('');
        setFilterMonth(currentMonth);
        setFilterYear(currentYear);
        setSelectedEmployee(null);
        router.get(route('dtr.view'), {}, { preserveState: false });
    };

    const hasSearched = Object.keys(records).length > 0;

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
                        <p className="text-xs opacity-80">Secure • Official • DENR-Accredited</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-md p-5 md:p-6 mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                        {/* Search Input */}
                        <div className="lg:col-span-5 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search employee name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Month */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <CalendarFold className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <select
                                    value={filterMonth}
                                    onChange={handleFilterChange(setFilterMonth, 'month')}
                                    className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                                    disabled={!availableDates || availableDates.length === 0} // disable if no data
                                >
                                    {availableDates && availableDates.length > 0 ? (
                                        availableDates
                                            .map(d => d.month)
                                            .filter((v, i, a) => a.indexOf(v) === i) // unique months
                                            .map((m) => (
                                                <option key={m} value={m}>
                                                    {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                                </option>
                                            ))
                                    ) : (
                                        <option value="" disabled>
                                            No records available
                                        </option>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Year */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Calendar1 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <select
                                    value={filterYear}
                                    onChange={handleFilterChange(setFilterYear, 'year')}
                                    className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                                    disabled={!availableDates || availableDates.length === 0} // disable if no data
                                >
                                    {availableDates && availableDates.length > 0 ? (
                                        availableDates
                                            .map(d => d.year)
                                            .filter((v, i, a) => a.indexOf(v) === i) // unique years
                                            .map((y) => (
                                                <option key={y} value={y}>{y}</option>
                                            ))
                                    ) : (
                                        <option value="" disabled>
                                            No records available
                                        </option>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="lg:col-span-3 flex gap-2">
                            <button
                                onClick={handleSearch}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-5 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" /> Search
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-5 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition shadow-sm"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
                    </div>
                )}

                {/* DTR Availability Notice */}
                {!isDTRAvailable && !loading && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">
                            <strong>DTR Download Unavailable:</strong> DTRs are generated after 12:59 PM daily.
                        </p>
                    </div>
                )}

                {/* No Search Prompt */}
                {!hasSearched && !loading && (
                    <div className="text-center py-12">
                        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Please search for an employee to view their DTR.</p>
                    </div>
                )}

                {/* Employee List */}
                {hasSearched && employeeList.length > 0 && (
                    <>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <User className="w-5 h-5 text-green-600" /> Select Employee
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {employeeList.map((emp) => (
                                    <button
                                        key={emp.employee_name}
                                        onClick={() => {
                                            setSelectedEmployee(emp.employee_name);
                                            handleSearch(emp.employee_name);
                                        }}
                                        className={`p-4 rounded-lg border-2 text-left transition-all shadow-sm hover:shadow-md ${
                                            selectedEmployee === emp.employee_name
                                                ? 'border-green-600 bg-green-50 text-green-800 font-medium'
                                                : 'border-gray-200 bg-white hover:border-green-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="truncate">{emp.employee_name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pagination */}
                        {employees.last_page > 1 && (
                            <div className="flex justify-center gap-2 mb-8 flex-wrap">
                                {Array.from({ length: employees.last_page }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => {
                                            setSelectedEmployee(null);
                                            router.get(
                                                route('dtr.view'),
                                                { page, search, month: filterMonth, year: filterYear },
                                                { preserveState: true }
                                            );
                                        }}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
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
                    </>
                )}

                {/* DTR Details */}
                {selectedEmployee && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <Clock className="w-6 h-6" /> {selectedEmployee}'s Daily Time Record
                            </h2>
                        </div>

                        <div className="p-6">
                            {Object.keys(records[selectedEmployee] || {}).length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No attendance records found for this period.</p>
                            ) : (
                                Object.entries(records[selectedEmployee]).map(([month, days]) => (
                                    <div key={month} className="mb-8 last:mb-0">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-green-700">
                                                {month} — Daily Time Record
                                            </h3>
                                            <a
                                                href={`/generate-dtr/${encodeURIComponent(selectedEmployee)}/${month}`}
                                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition ${
                                                    isDTRAvailable
                                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                                                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                }`}
                                                {...(!isDTRAvailable && { onClick: (e) => e.preventDefault() })}
                                            >
                                                <Download className="w-4 h-4" /> Download PDF
                                            </a>
                                        </div>

                                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                                            <table className="w-full text-sm">
                                                <thead className="bg-green-50 text-green-800 font-semibold">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">Day</th>
                                                        <th className="px-4 py-3 text-left">Weekday</th>
                                                        <th className="px-4 py-3 text-center">Check In</th>
                                                        <th className="px-4 py-3 text-center">Break Out</th>
                                                        <th className="px-4 py-3 text-center">Break In</th>
                                                        <th className="px-4 py-3 text-center">Check Out</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {Object.entries(days).map(([date, data]) => {
                                                        const { inTime, breakOut, breakIn, outTime } = processLogs(data.logs);
                                                        const dayNum = new Date(date).getDate();
                                                        return (
                                                            <tr key={date} className="hover:bg-green-50 transition">
                                                                <td className="px-4 py-3 font-medium text-gray-900">{dayNum}</td>
                                                                <td className="px-4 py-3 text-gray-600">{data.weekday}</td>
                                                                <td className="px-4 py-3 text-center font-mono text-green-700">{inTime || '-'}</td>
                                                                <td className="px-4 py-3 text-center font-mono text-orange-600">{breakOut || '-'}</td>
                                                                <td className="px-4 py-3 text-center font-mono text-orange-600">{breakIn || '-'}</td>
                                                                <td className="px-4 py-3 text-center font-mono text-red-600">{outTime || '-'}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="mt-16 text-center text-xs text-gray-500 pb-6">
                <p>© {new Date().getFullYear()} Department of Environment and Natural Resources - PENRO Bulacan</p>
                <p className="mt-1">For technical support, contact the MIS Unit.</p>
            </footer>
        </>
    );
}