import { User } from 'lucide-react';

export default function EmployeeList({
    employeeList,
    selectedEmployee,
    setSelectedEmployee,
    handleSearch,
    pagination,
    search,
    filterMonth,
    filterYear,
    router
}) {
    return (
        <>
            {/* Employee Selection */}
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
            {pagination?.last_page > 1 && (
                <div className="flex justify-center gap-2 mb-8 flex-wrap">
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
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
                                pagination.current_page === page
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
    );
}
