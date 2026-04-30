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
            <header className="bg-green-700 pt-12 pb-24 px-6 relative overflow-hidden text-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
                    <div className="flex items-center gap-6 mb-8 md:mb-0">
                        <Link 
                            href={route('dtr.view')}
                            className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
                        >
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </Link>
                        <div className="bg-white p-4 rounded-3xl shadow-xl shadow-green-900/20">
                            <Users className="w-10 h-10 text-green-700" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck size={14} className="text-green-100" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Administration</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-1">Personnel Directory</h1>
                            <p className="text-sm font-bold uppercase tracking-widest text-green-50 italic">Manage Employment Classifications</p>
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <button 
                            onClick={() => setShowHelp(!showHelp)}
                            className="inline-flex items-center gap-2 bg-white/10 px-6 py-2.5 rounded-2xl backdrop-blur-md border border-white/20 mb-4 hover:bg-white/20 transition-all text-white"
                        >
                            <HelpCircle size={16} />
                            <span className="text-[11px] font-black uppercase tracking-widest">How Merging Works?</span>
                        </button>
                        <div className="flex items-center justify-center md:justify-end gap-2 text-white/60">
                            <span className="text-[11px] font-black uppercase tracking-widest text-white/90">Total Personnel: {employees.length}</span>
                        </div>
                    </div>
                </div>
                <Zap className="absolute -right-20 -bottom-20 text-white/5" size={400} />
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto -mt-16 px-6 pb-20 relative z-20">
                
                {/* Help Section */}
                {showHelp && (
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-300/50 p-10 mb-10 border-4 border-green-500/20 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-4 rounded-3xl text-green-700">
                                    <HelpCircle size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Understanding Consolidation</h2>
                                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">A quick guide to merging duplicate profiles</p>
                                </div>
                            </div>
                            <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                <X className="text-gray-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-black">1</div>
                                        <h3 className="font-black text-gray-800 uppercase tracking-tight">The Source (Duplicate)</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                        Click the <GitMerge size={14} className="inline mx-1 text-blue-600" /> button on the profile you want to <strong>DELETE</strong>. 
                                        This is usually the misspelled name or the one with fewer records.
                                    </p>
                                    <div className="bg-blue-100/50 border border-blue-200 p-3 rounded-xl text-blue-800 text-[10px] font-black uppercase tracking-widest">
                                        This profile will be removed after the merge.
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-black">2</div>
                                        <h3 className="font-black text-gray-800 uppercase tracking-tight">The Target (Original)</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                        Select the profile you want to <strong>KEEP</strong>. 
                                        This is the correct spelling that will represent the employee in the directory.
                                    </p>
                                    <div className="bg-green-100/50 border border-green-200 p-3 rounded-xl text-green-800 text-[10px] font-black uppercase tracking-widest">
                                        This profile will receive all records from the Source.
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                                <ShieldCheck className="absolute -right-10 -bottom-10 text-white/5" size={200} />
                                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                    <AlertCircle className="text-green-400" />
                                    Data Safety Guarantee
                                </h3>
                                <ul className="space-y-4 text-sm font-bold text-gray-400">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></div>
                                        <span>NO DTR records are deleted during a merge.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></div>
                                        <span>Logs are automatically updated to point to the correct ID.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></div>
                                        <span>The combined history will now appear under one single PDF.</span>
                                    </li>
                                </ul>
                                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                                    <button 
                                        onClick={() => setShowHelp(false)}
                                        className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-green-900/40"
                                    >
                                        Got it, let's clean up!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Merge Banner */}
                {mergeMode && (
                    <div className="bg-blue-600 text-white p-6 rounded-[32px] mb-8 shadow-2xl shadow-blue-600/30 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                                <GitMerge className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg leading-tight uppercase tracking-tight">Consolidation Mode</h3>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    Merging: <span className="bg-white/10 px-2 py-0.5 rounded text-white">{sourceEmployee?.name}</span> 
                                    {targetEmployee && (
                                        <>
                                            <span className="text-white">into</span> 
                                            <span className="bg-white/10 px-2 py-0.5 rounded text-white">{targetEmployee?.name}</span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {targetEmployee ? (
                                <button 
                                    onClick={handleMerge}
                                    className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                                >
                                    <Check size={14} />
                                    Confirm Merge
                                </button>
                            ) : (
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 bg-blue-700 px-4 py-2 rounded-xl">Select Target Employee below</span>
                            )}
                            <button 
                                onClick={cancelMerge}
                                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 border border-white/20"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-8 md:p-10 mb-10 border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        {/* Search */}
                        <div className="md:col-span-8 relative group">
                            <label className="block text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2 ml-4">Search Registry</label>
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Find employee by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-[32px] text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-green-500/10 shadow-inner transition-all"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="md:col-span-4 relative group">
                            <label className="block text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2 ml-4">Classification Filter</label>
                            <div className="relative">
                                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-800 appearance-none focus:ring-4 focus:ring-green-500/10 shadow-inner"
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
                <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Employee Name</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Classification</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Registration</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((emp) => (
                                        <tr 
                                            key={emp.id} 
                                            className={`hover:bg-gray-50/50 transition-colors group ${
                                                mergeMode && targetEmployee?.id === emp.id ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''
                                            } ${mergeMode && sourceEmployee?.id === emp.id ? 'opacity-40 pointer-events-none grayscale' : ''}`}
                                        >
                                            <td className="px-8 py-6">
                                                {editingId === emp.id ? (
                                                    <input
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="w-full px-4 py-2 bg-white border-2 border-green-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-4 focus:ring-green-500/10 outline-none"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg font-bold text-xs uppercase ${
                                                            emp.status === 'PERMANENT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                        }`}>
                                                            {emp.name.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-black text-gray-800">{emp.name}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                {editingId === emp.id ? (
                                                    <select
                                                        value={data.status}
                                                        onChange={(e) => setData('status', e.target.value)}
                                                        className="w-full px-4 py-2 bg-white border-2 border-green-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-4 focus:ring-green-500/10 outline-none"
                                                    >
                                                        <option value="PERMANENT">Permanent</option>
                                                        <option value="JO">Job Order</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        emp.status === 'PERMANENT' 
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                                            : 'bg-orange-50 text-orange-700 border border-orange-100'
                                                    }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${emp.status === 'PERMANENT' ? 'bg-blue-400' : 'bg-orange-400'}`}></div>
                                                        {emp.status === 'PERMANENT' ? 'Permanent' : 'Job Order'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center gap-1 opacity-60">
                                                    <Clock size={12} className="text-gray-400" />
                                                    <span className="text-[10px] font-bold text-gray-500">{emp.added_ago}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {mergeMode ? (
                                                        <button 
                                                            onClick={() => setTargetEmployee(emp)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                targetEmployee?.id === emp.id 
                                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                            }`}
                                                        >
                                                            {targetEmployee?.id === emp.id ? 'Selected Target' : 'Select as Target'}
                                                        </button>
                                                    ) : editingId === emp.id ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleUpdate(emp.id)}
                                                                disabled={processing}
                                                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-90"
                                                                title="Save Changes"
                                                            >
                                                                <Save size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={cancelEditing}
                                                                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all active:scale-90"
                                                                title="Cancel"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                onClick={() => startMerge(emp)}
                                                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                                                                title="Merge with Duplicate"
                                                            >
                                                                <GitMerge size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => startEditing(emp)}
                                                                className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                                                                title="Edit Personnel"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(emp.id)}
                                                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all active:scale-90 opacity-0 group-hover:opacity-100"
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
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Users size={64} />
                                                <p className="text-sm font-black uppercase tracking-widest">No matching personnel found</p>
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

function Zap({ className, size }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M4 14.71 14.71 4" />
            <path d="M14.71 20 20 14.71" />
            <path d="m14.71 4-10.71 10.71" />
            <path d="m20 14.71-5.29 5.29" />
            <path d="M10 10l4 4" />
        </svg>
    );
}
