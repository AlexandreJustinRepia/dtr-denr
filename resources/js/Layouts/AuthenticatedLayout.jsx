import { useState, useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileText,
    User as UserIcon,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Bell,
    Search,
    ChevronLeft,
    Settings,
    HelpCircle
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Sidebar navigation items
    const navItems = [
        { label: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard') },
        { label: 'Generate DTR', href: route('dtr'), icon: FileText, active: route().current('dtr') },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out shadow-sm
                    ${isSidebarOpen ? 'w-64' : 'w-20'} 
                    ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="h-20 flex items-center px-6 border-b border-gray-50">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo className="h-10 w-auto" />
                            {isSidebarOpen && (
                                <div className="transition-opacity duration-300">
                                    <p className="text-sm font-black text-gray-900 uppercase leading-tight tracking-tighter">DENR</p>
                                    <p className="text-[8px] font-bold text-green-600 uppercase tracking-widest">Bulacan</p>
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all group
                                    ${item.active
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                                        : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
                                    }
                                `}
                            >
                                <item.icon size={20} className={item.active ? 'text-white' : 'text-gray-400 group-hover:text-green-600'} />
                                {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                            </Link>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-gray-50">
                        {isSidebarOpen ? (
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Support</p>
                                <div className="space-y-3">
                                    <button className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-green-600 transition-colors w-full">
                                        <HelpCircle size={14} /> Help Center
                                    </button>
                                    <button className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-green-600 transition-colors w-full">
                                        <Settings size={14} /> Settings
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 py-2">
                                <HelpCircle size={20} className="text-gray-400 cursor-pointer hover:text-green-600" />
                                <Settings size={20} className="text-gray-400 cursor-pointer hover:text-green-600" />
                            </div>
                        )}

                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="mt-4 hidden lg:flex items-center justify-center w-full py-2 text-gray-400 hover:text-green-600 transition-colors"
                        >
                            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {showingNavigationDropdown && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setShowingNavigationDropdown(false)}
                ></div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                            className="lg:hidden p-2 text-gray-400 hover:text-green-600 transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                            {header || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Quick Search..."
                                className="bg-transparent border-none text-sm focus:ring-0 placeholder:text-gray-400 font-medium ml-2"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="relative p-2 text-gray-400 hover:text-green-600 transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="h-8 w-px bg-gray-100 hidden sm:block mx-1"></div>

                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-3 p-1 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-black text-sm uppercase">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="hidden sm:block text-left">
                                                <p className="text-xs font-black text-gray-900 uppercase tracking-tighter leading-none mb-1">{user.name}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Administrator</p>
                                            </div>
                                            <ChevronDown size={14} className="text-gray-400 ml-1" />
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content width="48">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2">
                                            <UserIcon size={14} /> Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 text-red-600">
                                            <LogOut size={14} /> Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="px-8 py-6 border-t border-gray-50 text-center">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
                        &copy; {new Date().getFullYear()} DENR PENRO Bulacan • DTR Management System
                    </p>
                </footer>
            </div>
        </div>
    );
}
