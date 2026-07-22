import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import axios from 'axios';
import {
    Clock,
    Search,
    Edit2,
    Trash2,
    Plus,
    Calendar,
    User,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Filter
} from 'lucide-react';

export default function BreakManagement({ breaks, filters, employees, checkouts }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [fromDate, setFromDate] = useState(filters?.from_date || '');
    const [toDate, setToDate] = useState(filters?.to_date || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingId, setEditingId] = useState(null);
    const [breakToDelete, setBreakToDelete] = useState(null);
    const [checkoutToDelete, setCheckoutToDelete] = useState(null);

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);

    const [form, setForm] = useState({
        employee_id: '',
        employee_name: '',
        log_date: '',
        break_out_time: '',
        break_in_time: '',
    });

    const checkoutLookup = React.useMemo(() => {
        const map = {};
        if (checkouts) {
            Object.entries(checkouts).forEach(([employeeName, dates]) => {
                if (!map[employeeName]) map[employeeName] = {};
                Object.entries(dates).forEach(([logDate, record]) => {
                    map[employeeName][logDate] = record;
                });
            });
        }
        return map;
    }, [checkouts]);

    const openCreateModal = () => {
        setModalMode('create');
        setEditingId(null);
        setErrors({});
        setForm({
            employee_id: '',
            employee_name: '',
            log_date: '',
            break_out_time: '',
            break_in_time: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (br) => {
        setModalMode('edit');
        setEditingId(br.id);
        setErrors({});
        setForm({
            employee_id: br.employee_id || '',
            employee_name: br.employee_name,
            log_date: br.log_date,
            break_out_time: br.break_out_time || '',
            break_in_time: br.break_in_time || '',
        });
        setIsModalOpen(true);
    };

    const openDeleteModal = (br) => {
        setBreakToDelete(br);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setBreakToDelete(null);
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleSearch = () => {
        router.get(route('breaks.index'), { search: searchTerm, from_date: fromDate, to_date: toDate }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFromDate('');
        setToDate('');
        router.get(route('breaks.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fromDate, toDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            if (modalMode === 'create') {
                await axios.post(route('breaks.store'), form);
                showSuccess('Break record created successfully');
            } else {
                await axios.patch(route('breaks.update', editingId), form);
                showSuccess('Break record updated successfully');
            }
            closeModal();
            router.reload({ only: ['breaks'] });
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!breakToDelete) return;

        setProcessing(true);
        try {
            const response = await axios.delete(route('breaks.destroy', breakToDelete.id));
            if (response.data.error) {
                alert(response.data.error);
            } else {
                showSuccess('Break record removed successfully');
            router.reload({ only: ['breaks', 'checkouts'] });
            }
            closeDeleteModal();
        } catch (error) {
            if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                console.error(error);
                alert('Failed to delete break record.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleCheckoutDelete = async (logId) => {
        if (!confirm('Are you sure you want to delete this checkout record?')) return;

        setProcessing(true);
        try {
            await axios.delete(route('dtr.logs.destroy', logId));
            showSuccess('Checkout record removed successfully');
            router.reload({ only: ['breaks', 'checkouts'] });
        } catch (error) {
            console.error(error);
            alert('Failed to delete checkout record.');
        } finally {
            setProcessing(false);
        }
    };

    const handleEmployeeSelect = (employeeId) => {
        const employee = employees.find(e => e.id == employeeId);
        setForm({
            ...form,
            employee_id: employeeId,
            employee_name: employee ? employee.name : '',
        });
    };

    return (
        <AuthenticatedLayout header="Break Management">
            <Head title="Break Management | PENRO Bulacan" />

            <div className="space-y-6 relative">
                {successMessage && (
                    <div className="fixed top-20 right-6 z-[60] animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-green-800 text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 border border-green-600">
                            <CheckCircle2 size={18} className="text-green-200" />
                            <p className="text-sm font-bold uppercase tracking-wide">{successMessage}</p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded border border-gray-200 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Search Records</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Find by employee name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full max-w-md pl-9 pr-4 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <Calendar className="text-gray-400" size={16} />
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    placeholder="From"
                                />
                                <span className="text-gray-400 text-xs">to</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    placeholder="To"
                                />
                            </div>
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Filter size={14} />
                                Clear
                            </button>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm font-semibold transition-colors mt-5 md:mt-0"
                        >
                            <Plus size={16} />
                            Add Break Record
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Employee</th>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Date</th>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-center">Break Out</th>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-center">Break In</th>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-center">Check Out</th>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {breaks.data.length > 0 ? (
                                    breaks.data.map((br) => (
                                        <tr key={br.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-700 flex-shrink-0">
                                                        <User size={14} />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{br.employee_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center gap-1.5 text-gray-700">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {br.log_date}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${
                                                    br.break_out_time
                                                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                                                        : 'bg-gray-50 text-gray-400 border-gray-200'
                                                }`}>
                                                    <Clock size={12} />
                                                    {br.break_out_time || '--:--'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${
                                                    br.break_in_time
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-gray-50 text-gray-400 border-gray-200'
                                                }`}>
                                                    <Clock size={12} />
                                                    {br.break_in_time || '--:--'}
                                                </span>
                                             </td>
                                             <td className="px-6 py-3 text-center">
                                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${
                                                      checkoutLookup[br.employee_name]?.[br.log_date]?.checkout_time
                                                         ? 'bg-red-50 text-red-700 border-red-200'
                                                         : 'bg-gray-50 text-gray-400 border-gray-200'
                                                 }`}>
                                                     <Clock size={12} />
                                                     {checkoutLookup[br.employee_name]?.[br.log_date] || '--:--'}
                                                 </span>
                                             </td>
                                             <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(br)}
                                                        className="p-1.5 text-green-700 hover:bg-green-50 rounded transition-colors border border-transparent hover:border-green-200"
                                                        title="Edit Break Record"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(br)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
                                                        title="Delete Break Record"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Clock size={32} className="text-gray-300" />
                                                <p className="text-sm font-medium">No break records found matching your search</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {breaks.links.length > 3 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-medium">
                                Showing <span className="text-gray-900">{breaks.from}</span> to <span className="text-gray-900">{breaks.to}</span> of <span className="text-gray-900">{breaks.total}</span> records
                            </div>
                            <div className="flex items-center gap-1">
                                {breaks.links.map((link, i) => {
                                    if (link.label.includes('Previous')) {
                                        return (
                                            <Link
                                                key={i}
                                                href={link.url || '#'}
                                                className={`p-2 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-colors ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <ChevronLeft size={16} />
                                            </Link>
                                        );
                                    }
                                    if (link.label.includes('Next')) {
                                        return (
                                            <Link
                                                key={i}
                                                href={link.url || '#'}
                                                className={`p-2 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-colors ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <ChevronRight size={16} />
                                            </Link>
                                        );
                                    }
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`min-w-[32px] h-8 flex items-center justify-center rounded text-xs font-bold border transition-colors ${
                                                link.active
                                                    ? 'bg-green-700 border-green-700 text-white shadow-sm'
                                                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={16} className="text-red-600" />
                        Checkout Records
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Employee</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Date</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-center">Checkout Time</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {checkouts && Object.keys(checkouts).length > 0 ? (
                                Object.entries(checkouts).flatMap(([employeeName, dates]) =>
                                    Object.entries(dates).map(([logDate, record]) => (
                                        <tr key={`${employeeName}-${logDate}`} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-700 flex-shrink-0">
                                                        <User size={14} />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{employeeName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center gap-1.5 text-gray-700">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {logDate}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase border bg-red-50 text-red-700 border-red-200">
                                                    <Clock size={12} />
                                                    {record.checkout_time}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <button
                                                    onClick={() => handleCheckoutDelete(record.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
                                                    title="Delete Checkout"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Clock size={32} className="text-gray-300" />
                                                <p className="text-sm font-medium">No checkout records found</p>
                                            </div>
                                        </td>
                                    </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="lg">
                <div className="bg-white">
                    <div className="bg-green-800 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                            {modalMode === 'create' ? <Plus size={18} /> : <Edit2 size={18} />}
                            {modalMode === 'create' ? 'Add Break Record' : 'Edit Break Record'}
                        </h3>
                        <button onClick={closeModal} className="text-green-200 hover:text-white transition-colors">
                            <span className="text-lg leading-none">✕</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Employee</label>
                            <select
                                value={form.employee_id}
                                onChange={(e) => handleEmployeeSelect(e.target.value)}
                                className={`w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 ${errors.employee_id ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select Employee (Optional)</option>
                                {employees && employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                            {errors.employee_id && <p className="text-red-500 text-[10px] mt-1 font-semibold uppercase">{errors.employee_id[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Employee Name</label>
                            <input
                                type="text"
                                value={form.employee_name}
                                onChange={e => setForm({...form, employee_name: e.target.value})}
                                className={`w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 ${errors.employee_name ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {errors.employee_name && <p className="text-red-500 text-[10px] mt-1 font-semibold uppercase">{errors.employee_name[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date</label>
                            <input
                                type="date"
                                value={form.log_date}
                                onChange={e => setForm({...form, log_date: e.target.value})}
                                className={`w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 ${errors.log_date ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {errors.log_date && <p className="text-red-500 text-[10px] mt-1 font-semibold uppercase">{errors.log_date[0]}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Break Out Time</label>
                                <input
                                    type="time"
                                    min="12:00"
                                    max="12:59"
                                    placeholder="12:00 - 12:59"
                                    value={form.break_out_time}
                                    onChange={e => setForm({...form, break_out_time: e.target.value})}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 ${errors.break_out_time ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.break_out_time && <p className="text-red-500 text-[10px] mt-1 font-semibold uppercase">{errors.break_out_time[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Break In Time</label>
                                <input
                                    type="time"
                                    min="12:00"
                                    max="12:59"
                                    placeholder="12:00 - 12:59"
                                    value={form.break_in_time}
                                    onChange={e => setForm({...form, break_in_time: e.target.value})}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 ${errors.break_in_time ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.break_in_time && <p className="text-red-500 text-[10px] mt-1 font-semibold uppercase">{errors.break_in_time[0]}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-bold text-gray-500 uppercase hover:bg-gray-50 rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing && <Loader2 size={14} className="animate-spin" />}
                                {processing ? 'Processing...' : (modalMode === 'create' ? 'Add Record' : 'Save Changes')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="md">
                <div className="bg-white p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 uppercase">Confirm Deletion</h3>
                            <p className="text-sm text-gray-500">This action cannot be undone.</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
                        <p className="text-sm text-gray-700 font-medium">Are you sure you want to remove the break record for <span className="text-red-600 font-bold">{breakToDelete?.employee_name}</span> on <span className="text-red-600 font-bold">{breakToDelete?.log_date}</span>?</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                            Break Out: {breakToDelete?.break_out_time || '--:--'} | Break In: {breakToDelete?.break_in_time || '--:--'}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:bg-gray-100 rounded transition-colors"
                        >
                            No, Keep Record
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                        >
                            {processing && <Loader2 size={12} className="animate-spin" />}
                            {processing ? 'Removing...' : 'Yes, Delete Record'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
