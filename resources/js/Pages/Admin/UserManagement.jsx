import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import axios from 'axios';
import { 
    Users, 
    Search, 
    Edit2, 
    Trash2, 
    Save, 
    X, 
    UserPlus,
    ShieldCheck,
    Shield,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';

export default function UserManagement({ users, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [editingId, setEditingId] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);

    // Form State
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
    });

    const openCreateModal = () => {
        setModalMode('create');
        setEditingId(null);
        setErrors({});
        setForm({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'user',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setEditingId(user.id);
        setErrors({});
        setForm({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            password_confirmation: '',
        });
        setIsModalOpen(true);
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleSearch = () => {
        router.get(route('users.index'), { search: searchTerm }, {
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
    }, [searchTerm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            if (modalMode === 'create') {
                await axios.post(route('users.store'), form);
                showSuccess('User registered successfully');
            } else {
                await axios.patch(route('users.update', editingId), form);
                showSuccess('User updated successfully');
            }
            closeModal();
            router.reload({ only: ['users'] });
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        
        setProcessing(true);
        try {
            const response = await axios.delete(route('users.destroy', userToDelete.id));
            if (response.data.error) {
                alert(response.data.error);
            } else {
                showSuccess('User removed successfully');
                router.reload({ only: ['users'] });
            }
            closeDeleteModal();
        } catch (error) {
            if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                console.error(error);
                alert('Failed to delete user.');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthenticatedLayout header="System Users">
            <Head title="User Management | PENRO Bulacan" />

            <div className="space-y-6 relative">
                
                {/* Success Message Toast */}
                {successMessage && (
                    <div className="fixed top-20 right-6 z-[60] animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-green-800 text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 border border-green-600">
                            <CheckCircle2 size={18} className="text-green-200" />
                            <p className="text-sm font-bold uppercase tracking-wide">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Header Actions */}
                <div className="bg-white rounded border border-gray-200 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex-1 w-full relative">
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Search Users</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Find user by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full max-w-md pl-9 pr-4 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                        </div>
                        
                        <button 
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm font-semibold transition-colors mt-5"
                        >
                            <UserPlus size={16} />
                            Register User
                        </button>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Name & Email</th>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">System Role</th>
                                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3">
                                                <div>
                                                    <span className="font-bold text-gray-900 block">{user.name}</span>
                                                    <span className="text-xs text-gray-500">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${
                                                    user.role === 'admin' 
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                                        : 'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                    {user.role === 'admin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => openEditModal(user)}
                                                        className="p-1.5 text-green-700 hover:bg-green-50 rounded transition-colors border border-transparent hover:border-green-200"
                                                        title="Edit User"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => openDeleteModal(user)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users size={32} className="text-gray-300" />
                                                <p className="text-sm font-medium">No system users found matching your search</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links.length > 3 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-medium">
                                Showing <span className="text-gray-900">{users.from}</span> to <span className="text-gray-900">{users.to}</span> of <span className="text-gray-900">{users.total}</span> users
                            </div>
                            <div className="flex items-center gap-1">
                                {users.links.map((link, i) => {
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

            {/* Create/Edit Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="lg">
                <div className="bg-white">
                    <div className="bg-green-800 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                            {modalMode === 'create' ? <UserPlus size={18} /> : <Edit2 size={18} />}
                            {modalMode === 'create' ? 'Register New User' : 'Edit System User'}
                        </h3>
                        <button onClick={closeModal} className="text-green-200 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
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
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                                className={`w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold uppercase">{errors.email[0]}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">System Role</label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm({...form, role: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="user">Standard User</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            <div className="col-span-2 pt-2 border-t border-gray-100">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">
                                    {modalMode === 'create' ? 'Password Credentials' : 'Reset Password (Leave blank to keep current)'}
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={e => setForm({...form, password: e.target.value})}
                                            className={`w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Password"
                                            required={modalMode === 'create'}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="password"
                                            value={form.password_confirmation}
                                            onChange={e => setForm({...form, password_confirmation: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Confirm"
                                            required={modalMode === 'create'}
                                        />
                                    </div>
                                </div>
                                {errors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold uppercase">{errors.password[0]}</p>}
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
                                {processing ? 'Processing...' : (modalMode === 'create' ? 'Register User' : 'Save Changes')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
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
                        <p className="text-sm text-gray-700 font-medium">Are you sure you want to remove <span className="text-red-600 font-bold">{userToDelete?.name}</span> from the system?</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Email: {userToDelete?.email}</p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:bg-gray-100 rounded transition-colors"
                        >
                            No, Keep User
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                        >
                            {processing && <Loader2 size={12} className="animate-spin" />}
                            {processing ? 'Removing...' : 'Yes, Delete Account'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
