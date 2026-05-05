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
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-700" size={16} /> Personnel List
                </h3>
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                    {employees?.total || 0} Total
                </span>
            </div>

            {loadingEmployees ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded border border-gray-200">
                    <Loader2 className="w-6 h-6 animate-spin text-green-700 mb-3" />
                    <p className="text-sm text-gray-500">Loading personnel...</p>
                </div>
            ) : employeeList && employeeList.length > 0 ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                        {employeeList.map((emp) => (
                            <button
                                key={emp.employee_name}
                                onClick={() => setSelectedEmployee(emp.employee_name)}
                                className={`group p-3 rounded border text-left transition-colors flex items-center justify-between ${selectedEmployee === emp.employee_name
                                    ? "bg-green-50 border-green-500 text-green-900 shadow-sm"
                                    : "bg-white border-gray-200 hover:border-green-400 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 rounded flex items-center justify-center ${selectedEmployee === emp.employee_name
                                            ? "bg-green-200 text-green-800"
                                            : "bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-700"
                                            }`}
                                    >
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium block truncate max-w-[180px] leading-tight">
                                            {emp.employee_name}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className={`w-4 h-4 ${selectedEmployee === emp.employee_name ? "text-green-600" : "text-gray-400"}`} />
                            </button>
                        ))}
                    </div>

                    {/* Pagination */}
                    {employees?.last_page > 1 && (
                        <div className="flex justify-center gap-1 mt-6">
                            {Array.from({ length: employees.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${employees.current_page === page
                                        ? "bg-green-700 text-white"
                                        : "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded border border-gray-200">
                    <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">No personnel found.</p>
                </div>
            )}
        </div>
    );
}
