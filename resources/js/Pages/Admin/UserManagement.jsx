import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
    AlertCircle
} from 'lucide-react';

export default function UserManagement({ users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form for creating a new user
    const { 
        data: createData, 
        setData: setCreateData, 
        post: createPost, 
        processing: createProcessing, 
        errors: createErrors,
        reset: createReset 
    } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
    });

    // Form for editing an existing user
    const { 
        data: editData, 
        setData: setEditData, 
        patch: editPatch, 
        processing: editProcessing, 
        errors: editErrors,
        reset: editReset 
    } = useForm({
        name: '',
        email: '',
        role: '',
        password: '',
        password_confirmation: '',
    });

    const startEditing = (user) => {
        setEditingId(user.id);
        setIsCreating(false);
        setEditData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            password_confirmation: '',
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        editReset();
    };

    const handleUpdate = (id) => {
        editPatch(route('users.update', id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                editReset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to remove this user? This will revoke their system access.')) {
            router.delete(route('users.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createPost(route('users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreating(false);
                createReset();
            },
        });
    };

    const filteredUsers = users.filter(user => {
        return user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               user.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <AuthenticatedLayout header="System Users">
            <Head title="User Management | PENRO Bulacan" />

            <div className="space-y-6">
                
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
                        
                        {!isCreating && (
                            <button 
                                onClick={() => { setIsCreating(true); setEditingId(null); }}
                                className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm font-semibold transition-colors mt-5"
                            >
                                <UserPlus size={16} />
                                Create New User
                            </button>
                        )}
                    </div>
                </div>

                {/* Create Form */}
                {isCreating && (
                    <div className="bg-white rounded border border-green-200 shadow-sm overflow-hidden mb-6">
                        <div className="bg-green-50 px-6 py-4 border-b border-green-200 flex items-center justify-between">
                            <h3 className="font-bold text-green-900 flex items-center gap-2">
                                <UserPlus size={18} />
                                Register New System User
                            </h3>
                            <button 
                                onClick={() => { setIsCreating(false); createReset(); }}
                                className="text-green-700 hover:bg-green-100 p-1 rounded transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreate} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={createData.name}
                                        onChange={e => setCreateData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                    {createErrors.name && <p className="text-red-500 text-xs mt-1">{createErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={createData.email}
                                        onChange={e => setCreateData('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                    {createErrors.email && <p className="text-red-500 text-xs mt-1">{createErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={createData.password}
                                        onChange={e => setCreateData('password', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                    {createErrors.password && <p className="text-red-500 text-xs mt-1">{createErrors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={createData.password_confirmation}
                                        onChange={e => setCreateData('password_confirmation', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">System Role</label>
                                    <select
                                        value={createData.role}
                                        onChange={e => setCreateData('role', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="user">Standard User</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                    {createErrors.role && <p className="text-red-500 text-xs mt-1">{createErrors.role}</p>}
                                </div>
                            </div>
                            
                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={createProcessing}
                                    className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                    {createProcessing ? 'Saving...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3">
                                                {editingId === user.id ? (
                                                    <div className="space-y-2 max-w-sm">
                                                        <input
                                                            type="text"
                                                            value={editData.name}
                                                            onChange={(e) => setEditData('name', e.target.value)}
                                                            className="w-full px-3 py-1.5 bg-white border border-green-500 rounded text-sm text-gray-900 focus:ring-1 focus:ring-green-500 outline-none"
                                                            placeholder="Full Name"
                                                        />
                                                        {editErrors.name && <p className="text-red-500 text-xs">{editErrors.name}</p>}
                                                        
                                                        <input
                                                            type="email"
                                                            value={editData.email}
                                                            onChange={(e) => setEditData('email', e.target.value)}
                                                            className="w-full px-3 py-1.5 bg-white border border-green-500 rounded text-sm text-gray-900 focus:ring-1 focus:ring-green-500 outline-none"
                                                            placeholder="Email Address"
                                                        />
                                                        {editErrors.email && <p className="text-red-500 text-xs">{editErrors.email}</p>}
                                                        
                                                        <div className="pt-2 border-t border-gray-200">
                                                            <p className="text-xs text-gray-500 mb-1">Reset Password (leave blank to keep current)</p>
                                                            <input
                                                                type="password"
                                                                value={editData.password}
                                                                onChange={(e) => setEditData('password', e.target.value)}
                                                                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:border-green-500 outline-none mb-2"
                                                                placeholder="New Password"
                                                            />
                                                            <input
                                                                type="password"
                                                                value={editData.password_confirmation}
                                                                onChange={(e) => setEditData('password_confirmation', e.target.value)}
                                                                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:border-green-500 outline-none"
                                                                placeholder="Confirm New Password"
                                                            />
                                                            {editErrors.password && <p className="text-red-500 text-xs mt-1">{editErrors.password}</p>}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="font-bold text-gray-900 block">{user.name}</span>
                                                        <span className="text-xs text-gray-500">{user.email}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 align-top">
                                                {editingId === user.id ? (
                                                    <div className="max-w-[200px]">
                                                        <select
                                                            value={editData.role}
                                                            onChange={(e) => setEditData('role', e.target.value)}
                                                            className="w-full px-3 py-1.5 bg-white border border-green-500 rounded text-sm text-gray-900 focus:ring-1 focus:ring-green-500 outline-none"
                                                        >
                                                            <option value="user">Standard User</option>
                                                            <option value="admin">Administrator</option>
                                                        </select>
                                                        {editErrors.role && <p className="text-red-500 text-xs mt-1">{editErrors.role}</p>}
                                                    </div>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase border ${
                                                        user.role === 'admin' 
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                                            : 'bg-gray-50 text-gray-600 border-gray-200'
                                                    }`}>
                                                        {user.role === 'admin' ? <ShieldCheck size={14} /> : <Shield size={14} />}
                                                        {user.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-right align-top">
                                                <div className="flex items-center justify-end gap-2 mt-1">
                                                    {editingId === user.id ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleUpdate(user.id)}
                                                                disabled={editProcessing}
                                                                className="p-1.5 bg-green-700 hover:bg-green-800 text-white rounded transition-colors"
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
                                                                onClick={() => startEditing(user)}
                                                                className="p-1.5 text-green-700 hover:bg-green-50 rounded transition-colors border border-transparent hover:border-green-200"
                                                                title="Edit User"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(user.id)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
                                                                title="Delete User"
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
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
