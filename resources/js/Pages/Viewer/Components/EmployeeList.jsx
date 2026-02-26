import { User, Loader2, ChevronRight, Users } from "lucide-react";

export default function EmployeeList({
    employeeList,
    selectedEmployee,
    setSelectedEmployee,
    employees,
    search,
    filterMonth,
    filterYear,
    router,
    status,
    loadingEmployees,
}) {
    const goToPage = (page) => {
        setSelectedEmployee(null);
        router.get(
            route("dtr.view"),
            {
                page,
                search,
                month: filterMonth,
                year: filterYear,
                status,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-5 duration-700">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-700" size={14} /> Personnel List
                </h3>
                <span className="text-[11px] font-black text-green-700 bg-green-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                    {employees?.total || 0} Total
                </span>
            </div>

            {loadingEmployees ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                    <Loader2 className="w-10 h-10 animate-spin text-green-700 mb-4" />
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Updating Matrix...</p>
                </div>
            ) : employeeList && employeeList.length > 0 ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                        {employeeList.map((emp) => (
                            <button
                                key={emp.employee_name}
                                onClick={() => setSelectedEmployee(emp.employee_name)}
                                className={`group p-6 rounded-[32px] border-none text-left transition-all duration-300 relative overflow-hidden ${selectedEmployee === emp.employee_name
                                    ? "bg-green-700 text-white shadow-xl shadow-green-700/20 scale-[1.02] z-10"
                                    : "bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-100/50"
                                    }`}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${selectedEmployee === emp.employee_name
                                                ? "bg-white/10"
                                                : "bg-gray-50 group-hover:bg-green-100"
                                                }`}
                                        >
                                            <User size={18} className={selectedEmployee === emp.employee_name ? "text-white" : "text-green-700"} />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black uppercase tracking-widest mb-0.5 ${selectedEmployee === emp.employee_name ? "text-green-50" : "text-gray-500"}`}>Personnel</p>
                                            <span className="text-sm font-black tracking-tight block truncate max-w-[180px]">
                                                {emp.employee_name}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${selectedEmployee === emp.employee_name ? "text-white translate-x-1" : "text-gray-400 group-hover:text-green-700"}`} />
                                </div>
                                {selectedEmployee === emp.employee_name && (
                                    <div className="absolute -right-4 -bottom-4 bg-white/5 p-4 rounded-full">
                                        <Users size={60} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Pagination */}
                    {employees?.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-10">
                            {Array.from({ length: employees.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${employees.current_page === page
                                        ? "bg-green-700 text-white shadow-lg shadow-green-700/20"
                                        : "bg-white hover:bg-gray-50 text-gray-500 border border-gray-100"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-100" />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Personnel Detected</p>
                </div>
            )}
        </div>
    );
}
