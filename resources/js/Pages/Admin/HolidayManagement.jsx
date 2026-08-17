import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import axios from 'axios';
import {
    Calendar,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    X
} from 'lucide-react';

export default function HolidayManagement({ holidays, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingId, setEditingId] = useState(null);
    const [holidayToDelete, setHolidayToDelete] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);

    const [filterYear, setFilterYear] = useState(filters?.year || new Date().getFullYear().toString());
    const [filterMonth, setFilterMonth] = useState(filters?.month || (new Date().getMonth() + 1).toString().padStart(2, '0'));

    const [form, setForm] = useState({
        date: '',
        name: '',
        type: 'holiday',
    });

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const fetchHolidays = () => {
        router.get(route('holidays.index'), { year: filterYear, month: filterMonth }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchHolidays();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [filterYear, filterMonth]);

    const openCreateModal = () => {
        setModalMode('create');
        setEditingId(null);
        setErrors({});
        setForm({
            date: `${filterYear}-${filterMonth}-01`,
            name: '',
            type: 'holiday',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (holiday) => {
        setModalMode('edit');
        setEditingId(holiday.id);
        setErrors({});
        setForm({
            date: holiday.date,
            name: holiday.name,
            type: holiday.type,
        });
        setIsModalOpen(true);
    };

    const openDeleteModal = (holiday) => {
        setHolidayToDelete(holiday);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setHolidayToDelete(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            if (modalMode === 'create') {
                await axios.post(route('holidays.store'), form);
                showSuccess('Holiday created successfully');
            } else {
                await axios.patch(route('holidays.update', editingId), form);
                showSuccess('Holiday updated successfully');
            }
            closeModal();
            router.reload({ only: ['holidays'] });
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!holidayToDelete) return;

        setProcessing(true);
        try {
            const response = await axios.delete(route('holidays.destroy', holidayToDelete.id));
            if (response.data.success) {
                showSuccess('Holiday removed successfully');
                router.reload({ only: ['holidays'] });
            }
            closeDeleteModal();
        } catch (error) {
            console.error(error);
            alert('Failed to delete holiday.');
        } finally {
            setProcessing(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);
    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    return (
        <AuthenticatedLayout header="Holiday Management">
            <Head title="Holiday Management | PENRO Bulacan" />

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
                        <div className="flex items-center gap-3">
                            <Calendar className="text-gray-400" size={20} />
                            <div className="flex items-center gap-2">
                                <select
                                    value={filterMonth}
                                    onChange={(e) => setFilterMonth(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                        >
                            <Plus size={16} />
                            Add Holiday
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Date</th>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Name</th>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-center">Type</th>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {holidays.data.length > 0 ? (
                                    holidays.data.map((h) => (
                                        <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center gap-1.5 text-gray-700">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {h.date}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="font-bold text-gray-900">{h.name}</span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${
                                                    h.type === 'holiday'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : 'bg-orange-50 text-orange-700 border-orange-200'
                                                }`}>
                                                    {h.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(h)}
                                                        className="p-1.5 text-green-700 hover:bg-green-50 rounded transition-colors border border-transparent hover:border-green-200"
                                                        title="Edit Holiday"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(h)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
                                                        title="Delete Holiday"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Calendar size={32} className="text-gray-300" />
                                                <p className="text-sm font-medium">No holidays found for this month</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="bg-white">
                    <div className="bg-green-800 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                            {modalMode === 'create' ? <Plus size={18} /> : <Edit2 size={18} />}
                            {modalMode === 'create' ? 'Add Holiday' : 'Edit Holiday'}
                        </h3>
                        <button onClick={closeModal} className="text-green-200 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm({...form, date: e.target.value})}
                                className={`w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {errors.date && <p className="text-red-500 text-[10px] mt-1 font-semibold uppercase">{errors.date[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Holiday Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({...form, name: e.target.value})}
                                className={`w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold uppercase">{errors.name[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Type</label>
                            <select
                                value={form.type}
                                onChange={e => setForm({...form, type: e.target.value})}
                                className={`w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="holiday">Holiday</option>
                                <option value="suspended">Suspended Day</option>
                            </select>
                            {errors.type && <p className="text-red-500 text-[10px] mt-1 font-semibold uppercase">{errors.type[0]}</p>}
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
                                {processing ? 'Processing...' : (modalMode === 'create' ? 'Add Holiday' : 'Save Changes')}
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
                        <p className="text-sm text-gray-700 font-medium">
                            Are you sure you want to remove <span className="text-red-600 font-bold">{holidayToDelete?.name}</span> on <span className="text-red-600 font-bold">{holidayToDelete?.date}</span>?
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
                            {processing ? 'Removing...' : 'Yes, Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
