import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { 
    Users, 
    Search, 
    Edit2, 
    Trash2, 
    Save, 
    X, 
    UserCheck, 
    UserPlus,
    Building2,
    ShieldCheck,
    Clock,
    Filter,
    ArrowLeft,
    GitMerge,
    AlertCircle,
    Check,
    HelpCircle
} from 'lucide-react';

export default function EmployeeManagement({ employees }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showHelp, setShowHelp] = useState(false);
    
    // Merge state
    const [mergeMode, setMergeMode] = useState(false);
    const [sourceEmployee, setSourceEmployee] = useState(null);
    const [targetEmployee, setTargetEmployee] = useState(null);

    const { data, setData, patch, delete: destroy, post, processing, reset } = useForm({
        name: '',
        status: '',
        source_id: '',
        target_id: '',
    });

    const startEditing = (employee) => {
        setEditingId(employee.id);
        setData({
            name: employee.name,
            status: employee.status,
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        reset();
    };

    const handleUpdate = (id) => {
        patch(route('employees.update', id), {
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to remove this employee? This will not delete their attendance records but will remove them from this management list.')) {
            destroy(route('employees.destroy', id));
        }
    };

    const startMerge = (employee) => {
        setMergeMode(true);
        setSourceEmployee(employee);
    };

    const cancelMerge = () => {
        setMergeMode(false);
        setSourceEmployee(null);
        setTargetEmployee(null);
    };

    const handleMerge = () => {
        if (!sourceEmployee || !targetEmployee) return;

        if (confirm(`Are you sure you want to merge "${sourceEmployee.name}" into "${targetEmployee.name}"? \n\nAll DTR records for ${sourceEmployee.name} will be moved to ${targetEmployee.name}, and the duplicate profile will be deleted.`)) {
            router.post(route('employees.merge'), {
                source_id: sourceEmployee.id,
                target_id: targetEmployee.id
            }, {
                onSuccess: () => {
                    setMergeMode(false);
                    setSourceEmployee(null);
                    setTargetEmployee(null);
                }
            });
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-green-100 selection:text-green-900">
            <Head title="Employee Management | PENRO Bulacan" />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-8 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <Link 
                            href={route('dtr.view')}
                            className="p-2 rounded hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Administration</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Personnel Directory</h1>
                            <p className="text-sm font-medium text-gray-500">Manage Employment Classifications</p>
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <button 
                            onClick={() => setShowHelp(!showHelp)}
                            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded border border-gray-300 mb-2 hover:bg-gray-50 transition-colors text-gray-700"
                        >
                            <HelpCircle size={14} />
                            <span className="text-xs font-semibold">How Merging Works</span>
                        </button>
                        <div className="flex items-center justify-center md:justify-end gap-2 text-gray-500">
                            <span className="text-sm font-medium">Total Personnel: {employees.length}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                
                {/* Help Section */}
                {showHelp && (
                    <div className="bg-white rounded border border-green-200 shadow-sm p-6 md:p-8 mb-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 p-2 rounded text-green-700 border border-green-200">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Understanding Consolidation</h2>
                                    <p className="text-sm text-gray-500">A guide to merging duplicate profiles</p>
                                </div>
                            </div>
                            <button onClick={() => setShowHelp(false)} className="p-1.5 hover:bg-gray-100 rounded transition-colors border border-transparent">
                                <X className="text-gray-500" size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold">1</div>
                                        <h3 className="font-bold text-gray-800 text-sm">The Source (Duplicate)</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Click the <GitMerge size={14} className="inline mx-1 text-blue-600" /> button on the profile you want to <strong>DELETE</strong>. 
                                        This is usually the misspelled name or the one with fewer records.
                                    </p>
                                    <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded text-blue-800 text-xs font-semibold">
                                        This profile will be removed after the merge.
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-green-600 text-white rounded flex items-center justify-center text-xs font-bold">2</div>
                                        <h3 className="font-bold text-gray-800 text-sm">The Target (Original)</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Select the profile you want to <strong>KEEP</strong>. 
                                        This is the correct spelling that will represent the employee in the directory.
                                    </p>
                                    <div className="bg-green-50 border border-green-200 px-3 py-2 rounded text-green-800 text-xs font-semibold">
                                        This profile will receive all records from the Source.
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded p-6">
                                <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-900">
                                    <ShieldCheck className="text-green-600" size={18} />
                                    Data Safety Guarantee
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                        <span>NO DTR records are deleted during a merge.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                        <span>Logs are automatically updated to point to the correct ID.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                        <span>The combined history will now appear under one single PDF.</span>
                                    </li>
                                </ul>
                                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                                    <button 
                                        onClick={() => setShowHelp(false)}
                                        className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded text-sm font-medium transition-colors w-full"
                                    >
                                        Got it
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Merge Banner */}
                {mergeMode && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50">
                        <div className="flex items-center gap-3">
                            <GitMerge className="w-5 h-5 text-blue-600" />
                            <div>
                                <h3 className="font-bold text-blue-900 text-sm">Consolidation Mode</h3>
                                <p className="text-blue-800 text-xs flex items-center gap-1">
                                    Merging: <span className="font-semibold bg-white px-1 border border-blue-100 rounded">{sourceEmployee?.name}</span> 
                                    {targetEmployee && (
                                        <>
                                            <span>into</span> 
                                            <span className="font-semibold bg-white px-1 border border-blue-100 rounded">{targetEmployee?.name}</span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {targetEmployee ? (
                                <button 
                                    onClick={handleMerge}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                                >
                                    <Check size={14} />
                                    Confirm Merge
                                </button>
                            ) : (
                                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1.5 rounded border border-blue-200">Select Target Employee below</span>
                            )}
                            <button 
                                onClick={cancelMerge}
                                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded text-xs font-semibold border border-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded border border-gray-200 shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        {/* Search */}
                        <div className="md:col-span-8 relative">
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Search Registry</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Find employee by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="md:col-span-4 relative">
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Classification Filter</label>
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                                >
                                    <option value="ALL">All Classifications</option>
                                    <option value="PERMANENT">Permanent Personnel</option>
                                    <option value="JO">Job Order (JO)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employees List */}
                <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600">Employee Name</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600">Classification</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600 text-center">Registration</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((emp) => (
                                        <tr 
                                            key={emp.id} 
                                            className={`hover:bg-gray-50 transition-colors group ${
                                                mergeMode && targetEmployee?.id === emp.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                                            } ${mergeMode && sourceEmployee?.id === emp.id ? 'opacity-40 pointer-events-none grayscale' : ''}`}
                                        >
                                            <td className="px-6 py-3">
                                                {editingId === emp.id ? (
                                                    <input
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="w-full px-3 py-1.5 bg-white border border-green-500 rounded text-sm text-gray-900 focus:ring-1 focus:ring-green-500 outline-none"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-gray-900">{emp.name}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-3">
                                                {editingId === emp.id ? (
                                                    <select
                                                        value={data.status}
                                                        onChange={(e) => setData('status', e.target.value)}
                                                        className="w-full px-3 py-1.5 bg-white border border-green-500 rounded text-sm text-gray-900 focus:ring-1 focus:ring-green-500 outline-none"
                                                    >
                                                        <option value="PERMANENT">Permanent</option>
                                                        <option value="JO">Job Order</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                                        emp.status === 'PERMANENT' 
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                            : 'bg-orange-50 text-orange-700 border-orange-200'
                                                    }`}>
                                                        {emp.status === 'PERMANENT' ? 'Permanent' : 'Job Order'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <div className="text-xs text-gray-500">
                                                    {emp.added_ago}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {mergeMode ? (
                                                        <button 
                                                            onClick={() => setTargetEmployee(emp)}
                                                            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
                                                                targetEmployee?.id === emp.id 
                                                                ? 'bg-blue-600 text-white border-blue-600' 
                                                                : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200'
                                                            }`}
                                                        >
                                                            {targetEmployee?.id === emp.id ? 'Selected Target' : 'Select Target'}
                                                        </button>
                                                    ) : editingId === emp.id ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleUpdate(emp.id)}
                                                                disabled={processing}
                                                                className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                                                title="Save Changes"
                                                            >
                                                                <Save size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={cancelEditing}
                                                                className="p-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-600 rounded transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                onClick={() => startMerge(emp)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors border border-transparent hover:border-blue-200"
                                                                title="Merge with Duplicate"
                                                            >
                                                                <GitMerge size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => startEditing(emp)}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors border border-transparent hover:border-green-200"
                                                                title="Edit Personnel"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(emp.id)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
                                                                title="Delete From Registry"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users size={32} className="text-gray-300" />
                                                <p className="text-sm font-medium">No matching personnel found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
