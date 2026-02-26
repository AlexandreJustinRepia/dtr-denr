import { Search, CalendarFold, Calendar1, Loader2, Zap, RotateCcw } from 'lucide-react';

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

    return (
        <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-8 md:p-10 mb-10 border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-green-100 p-2 rounded-xl">
                    <Search className="w-4 h-4 text-green-700" />
                </div>
                <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Refine Retrieval Parameters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-end">
                {/* Search Input */}
                <div className="lg:col-span-12 relative group">
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2 ml-4">Search Personnel</label>
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Type employee name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-[32px] text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-green-500/10 shadow-inner transition-all"
                            disabled={loadingEmployees}
                        />
                    </div>
                </div>

                {/* Filters Row */}
                <div className="lg:col-span-3 relative group">
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2 ml-4">Month Selection</label>
                    <div className="relative">
                        <CalendarFold className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600" />
                        <select
                            value={filterMonth}
                            onChange={handleFilterChange(setFilterMonth, 'month')}
                            className="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-800 appearance-none focus:ring-4 focus:ring-green-500/10 shadow-inner"
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
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2 ml-4">Fiscal Year</label>
                    <div className="relative">
                        <Calendar1 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600" />
                        <select
                            value={filterYear}
                            onChange={handleFilterChange(setFilterYear, 'year')}
                            className="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-800 appearance-none focus:ring-4 focus:ring-green-500/10 shadow-inner"
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
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2 ml-4">Employment Status</label>
                    <div className="relative">
                        <select
                            value={status}
                            onChange={handleFilterChange(setStatus, 'status')}
                            className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-800 appearance-none focus:ring-4 focus:ring-green-500/10 shadow-inner"
                            disabled={loadingEmployees}
                        >
                            <option value="">All Status</option>
                            <option value="Permanent">Permanent</option>
                            <option value="JO">Job Order (JO)</option>
                        </select>
                    </div>
                </div>

                {/* Search Button */}
                <div className="lg:col-span-3 flex gap-3">
                    <button
                        onClick={handleSearch}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white font-black uppercase tracking-widest text-xs py-5 px-6 rounded-2xl transition-all shadow-lg shadow-green-700/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        disabled={loadingEmployees}
                    >
                        {loadingEmployees ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Zap className="w-4 h-4 fill-current" /> Search
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleReset}
                        className="p-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-all shadow-sm active:scale-95 group disabled:opacity-50"
                        disabled={loadingEmployees}
                        title="Reset Filters"
                    >
                        <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 text-gray-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}
