import { Search, CalendarFold, Calendar1, Loader2, Zap, RotateCcw, Download } from 'lucide-react';

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
    status,
    setStatus,
    loadingEmployees,
    handleBulkDownload,
    downloadLoading
}) {
    const handleFilterChange = (setter, type) => (e) => {
        const newValue = type === 'status' ? e.target.value : Number(e.target.value);
        setter(newValue);

        const monthValue = type === 'month' ? newValue : filterMonth;
        const yearValue = type === 'year' ? newValue : filterYear;
        const statusValue = type === 'status' ? newValue : status;

        performRequest({
            searchValue: search,
            monthValue,
            yearValue,
            statusValue,
            updateList: !selectedEmployee,
        });
    };

    const isBulkLoading = downloadLoading[`bulk-${status}-${filterMonth}-${filterYear}`];

    return (
        <div className="bg-white rounded border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-500" />
                    <h2 className="text-base font-semibold text-gray-800">Filter Records</h2>
                </div>

                <button
                    onClick={handleBulkDownload}
                    disabled={loadingEmployees || isBulkLoading}
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isBulkLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Download size={14} />
                    )}
                    {status ? `Download ${status} PDFs` : 'Download All PDFs'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                {/* Search Input */}
                <div className="lg:col-span-12 relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Personnel</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Type employee name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none"
                            disabled={loadingEmployees}
                        />
                    </div>
                </div>

                {/* Filters Row */}
                <div className="lg:col-span-3 relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <div className="relative">
                        <CalendarFold className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={filterMonth}
                            onChange={handleFilterChange(setFilterMonth, 'month')}
                            className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none"
                            disabled={loadingEmployees || !availableDates?.length}
                        >
                            {availableDates?.length ? (
                                [...new Set(availableDates.map(d => d.month))].map(m => (
                                    <option key={m} value={m}>
                                        {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No records</option>
                            )}
                        </select>
                    </div>
                </div>

                <div className="lg:col-span-3 relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <div className="relative">
                        <Calendar1 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={filterYear}
                            onChange={handleFilterChange(setFilterYear, 'year')}
                            className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none"
                            disabled={loadingEmployees || !availableDates?.length}
                        >
                            {availableDates?.length ? (
                                [...new Set(availableDates.map(d => d.year))].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))
                            ) : (
                                <option value="" disabled>No records</option>
                            )}
                        </select>
                    </div>
                </div>

                <div className="lg:col-span-3 relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="relative">
                        <select
                            value={status}
                            onChange={handleFilterChange(setStatus, 'status')}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none"
                            disabled={loadingEmployees}
                        >
                            <option value="">All Status</option>
                            <option value="PERMANENT">Permanent</option>
                            <option value="JO">Job Order (JO)</option>
                        </select>
                    </div>
                </div>

                {/* Search Button */}
                <div className="lg:col-span-3 flex gap-2 h-[38px]">
                    <button
                        onClick={handleSearch}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white font-medium text-sm rounded flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        disabled={loadingEmployees}
                    >
                        {loadingEmployees ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Search
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleReset}
                        className="w-[38px] bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 rounded flex items-center justify-center transition-colors disabled:opacity-50"
                        disabled={loadingEmployees}
                        title="Reset Filters"
                    >
                        <RotateCcw className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}
