import { Search, CalendarFold, Calendar1 } from 'lucide-react';

export default function SearchFilters({
    search,
    setSearch,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    availableDates,
    handleKeyDown,
    handleSearch,
    handleReset,
    selectedEmployee,
    performRequest,
}) {
    const handleFilterChange = (setter, type) => (e) => {
        const newValue = Number(e.target.value);
        setter(newValue);

        performRequest({
            searchValue: type === 'month' || type === 'year' ? search : e.target.value,
            monthValue: type === 'month' ? newValue : filterMonth,
            yearValue: type === 'year' ? newValue : filterYear,
        });
    };

    return (
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
                            disabled={!availableDates || availableDates.length === 0}
                        >
                            {availableDates?.length ? (
                                [...new Set(availableDates.map(d => d.month))].map(m => (
                                    <option key={m} value={m}>
                                        {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No records available</option>
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
                            disabled={!availableDates || availableDates.length === 0}
                        >
                            {availableDates?.length ? (
                                [...new Set(availableDates.map(d => d.year))].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))
                            ) : (
                                <option value="" disabled>No records available</option>
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
    );
}
