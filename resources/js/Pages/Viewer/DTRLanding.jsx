import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function DTRLanding({ records, employees, filters }) {
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
        // if both empty and no selected override => don't search
        if (!search.trim() && !selected) return;
        performRequest({ searchValue: search, monthValue: filterMonth, yearValue: filterYear, selected });
    };

    const handleKeyDown = (e) => e.key === 'Enter' && handleSearch();

    const handleFilterChange = (setter, type) => (e) => {
        const newValue = Number(e.target.value);

        // compute the new filter values we will use for the request
        const newMonth = type === 'month' ? newValue : filterMonth;
        const newYear = type === 'year' ? newValue : filterYear;

        // update state (UI)
        setter(newValue);

        // decide what to request:
        if (selectedEmployee) {
            // explicitly request for selectedEmployee and use the new filter values
            performRequest({ searchValue: search, monthValue: newMonth, yearValue: newYear, selected: selectedEmployee });
        } else if (search.trim()) {
            // user already searched by name, preserve that search text
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
        <div className="max-w-7xl mx-auto p-6">
        <Head title="Penro Bulacan DTR Generator" />

        <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800">
            Welcome to Penro Bulacan DTR Generator
            </h1>
            <p className="text-gray-600 mt-2">Search your name to view and download your DTR</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border rounded px-4 py-2 w-full md:w-1/3 focus:outline-none focus:ring focus:border-blue-300"
            />

            <div className="flex gap-2 w-full md:w-auto">
            <select
                value={filterMonth}
                onChange={handleFilterChange(setFilterMonth, 'month')}
                className="border rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            >
                {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
                ))}
            </select>

            <select
                value={filterYear}
                onChange={handleFilterChange(setFilterYear, 'year')}
                className="border rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            >
                {[2023, 2024, 2025].map((y) => (
                <option key={y} value={y}>{y}</option>
                ))}
            </select>

            <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Search
            </button>
            <button onClick={handleReset} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">
                Reset
            </button>
            </div>
        </div>

        {loading && <p className="text-center text-blue-600 mb-6">Loading...</p>}

        {!isDTRAvailable && (
            <p className="text-center text-red-600 mb-6">
            DTR will become available at the end of the workday (12:59 PM)
            </p>
        )}

        {!hasSearched ? (
            <p className="text-center text-gray-600">Please search your name to view your DTR.</p>
        ) : (
            <>
            {/* Employee list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {employeeList.map((emp) => (
                    <button
                    key={emp.employee_name}
                    onClick={() => {
                        setSelectedEmployee(emp.employee_name);
                        handleSearch(emp.employee_name);
                    }}
                    className={`border rounded-lg px-4 py-2 text-left hover:bg-blue-50 ${
                        selectedEmployee === emp.employee_name ? 'bg-blue-100 border-blue-500' : ''
                    }`}
                    >
                    <span className="font-semibold text-blue-700">{emp.employee_name}</span>
                    </button>
                ))}
            </div>

            {/* Pagination */}
            {employees.last_page > 1 && (
                <div className="flex justify-center mb-6 gap-2">
                {Array.from({ length: employees.last_page }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => {
                        setSelectedEmployee(null); // reset selection
                        router.get(
                            route('dtr.view'),
                            { page, search, month: filterMonth, year: filterYear },
                            { preserveState: true }
                        );
                        }}
                        className={`px-3 py-1 rounded ${
                        employees.current_page === page ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}
                    >
                        {page}
                    </button>
                    ))}
                </div>
            )}

            {/* Employee Record Details */}
            {selectedEmployee && (
                <div className="border rounded-lg bg-white shadow p-4">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg -mx-4 -mt-4 mb-4">
                    <h2 className="text-lg font-semibold">{selectedEmployee}</h2>
                </div>

                {Object.keys(records[selectedEmployee] || {}).length === 0 ? (
                    <p className="text-center text-gray-500">No records uploaded yet.</p>
                ) : (
                    Object.entries(records[selectedEmployee]).map(([month, days]) => (
                    <div key={month} className="mb-6">
                        <h3 className="text-blue-700 font-medium mb-3">
                        {month} — Daily Time Record
                        </h3>
                        <a
                            href={`/generate-dtr/${encodeURIComponent(selectedEmployee)}/${month}`}
                            className={`px-4 py-2 rounded hover:bg-blue-700 text-white ${
                                !isDTRAvailable ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'
                            }`}
                            {...(!isDTRAvailable && { onClick: (e) => e.preventDefault() })}
                        >
                        Download DTR (DOCX)
                        </a>

                        <div className="overflow-x-auto mt-4">
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
                    ))
                )}
                </div>
            )}
            </>
        )}
        </div>
    );
}
