import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Download, User, Clock, AlertCircle, Building2 } from 'lucide-react';
import Footer from '@/Components/Footer';
import SearchFilters from './Components/SearchFilter';
import EmployeeList from './Components/EmployeeList';

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

        router.get(
            route('dtr.view'),
            { search: selected ?? searchValue, month: monthValue, year: yearValue },
            {
                preserveState: true,
                onStart: () => setLoading(true), // <-- optional, double safety
                onFinish: () => setLoading(false)
            }
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

    const handleSearch = (selected = null) => {
        if (!search.trim() && !selected) return;
        setLoading(true);
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
                        {/*<p className="text-xs opacity-80">Secure • Official • DENR-Accredited</p> */}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Search Filter */}
                <SearchFilters
                    search={search}
                    setSearch={setSearch}
                    filterMonth={filterMonth}
                    setFilterMonth={setFilterMonth}
                    filterYear={filterYear}
                    setFilterYear={setFilterYear}
                    availableDates={availableDates}
                    loading={loading}
                    handleKeyDown={handleKeyDown}
                    handleSearch={handleSearch}
                    handleReset={handleReset}
                    selectedEmployee={selectedEmployee}
                    performRequest={performRequest}
                />

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
                    </div>
                )}

                {/* DTR Availability Notice */}
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">
                        DTRs are uploaded after <strong>12:59 PM</strong> on the <strong>last workday of each month</strong>.
                    </p>
                </div>

                {/* No Search Prompt */}
                {!hasSearched && !loading && (
                    <div className="text-center py-12">
                        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Please search for an employee to view their DTR.</p>
                    </div>
                )}

                {/* Employee List */}
                {hasSearched && employeeList.length > 0 && (
                    <EmployeeList
                        employeeList={employeeList}
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={setSelectedEmployee}
                        handleSearch={handleSearch}
                        pagination={employees}
                        search={search}
                        filterMonth={filterMonth}
                        filterYear={filterYear}
                        router={router}
                    />
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
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition bg-green-600 hover:bg-green-700 text-white shadow-md"
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
                                                                <td className="px-4 py-3 text-center font-mono text-green-700">{inTime || ''}</td>
                                                                <td className="px-4 py-3 text-center font-mono text-orange-600">{breakOut || ''}</td>
                                                                <td className="px-4 py-3 text-center font-mono text-orange-600">{breakIn || ''}</td>
                                                                <td className="px-4 py-3 text-center font-mono text-red-600">{outTime || ''}</td>
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
            <Footer/>
        </>
    );
}