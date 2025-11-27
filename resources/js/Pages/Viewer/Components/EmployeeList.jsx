import { User, Loader2 } from "lucide-react";

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
    loadingEmployees, // new prop
}) {
    // Handle page navigation
    const goToPage = (page) => {
        setSelectedEmployee(null); // reset selected employee
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
        <>
            {loadingEmployees ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                </div>
            ) : employeeList && employeeList.length > 0 ? (
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
                                        ? "border-green-600 bg-green-50 text-green-800 font-semibold ring-2 ring-green-200"
                                        : "border-gray-200 bg-white hover:border-green-300"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-3 h-3 rounded-full ${
                                            selectedEmployee === emp.employee_name
                                                ? "bg-green-600"
                                                : "bg-green-400"
                                        }`}
                                    ></div>
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
                                    onClick={() => goToPage(page)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        employees.current_page === page
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
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
        </>
    );
}
