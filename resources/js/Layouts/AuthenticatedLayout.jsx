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
    HelpCircle,
    Users,
    Clock,
    Calendar
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Sidebar navigation items
    const navItems = [
        { label: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard') },
        { label: 'Log Processor', href: route('dtr'), icon: FileText, active: route().current('dtr') },
        { label: 'Break Manager', href: route('breaks.index'), icon: Clock, active: route().current('breaks.index') },
        { label: 'Holiday Manager', href: route('holidays.index'), icon: Calendar, active: route().current('holidays.index') },
        { label: 'System Users', href: route('users.index'), icon: Users, active: route().current('users.index') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-200 ease-in-out
                    ${isSidebarOpen ? 'w-64' : 'w-20'} 
                    ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-200">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo className="h-8 w-auto" />
                            {isSidebarOpen && (
                                <div className="transition-opacity duration-200">
                                    <p className="text-sm font-bold text-gray-900 uppercase leading-none mb-1">DENR</p>
                                    <p className="text-[10px] font-semibold text-green-700 uppercase leading-none">PENRO Bulacan</p>
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors
                                    ${item.active
                                        ? 'bg-green-700 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }
                                `}
                            >
                                <item.icon size={18} className={item.active ? 'text-white' : 'text-gray-400'} />
                                {isSidebarOpen && <span>{item.label}</span>}
                            </Link>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-3 border-t border-gray-200">
                        {isSidebarOpen ? (
                            <div className="bg-gray-50 rounded border border-gray-200 p-3">
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Administration</p>
                                <div className="space-y-1">
                                    <button className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-green-700 transition-colors w-full px-2 py-1.5 rounded hover:bg-white">
                                        <HelpCircle size={14} /> Help Center
                                    </button>
                                    <button className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-green-700 transition-colors w-full px-2 py-1.5 rounded hover:bg-white">
                                        <Settings size={14} /> Settings
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 py-2">
                                <HelpCircle size={18} className="text-gray-400 cursor-pointer hover:text-green-700" />
                                <Settings size={18} className="text-gray-400 cursor-pointer hover:text-green-700" />
                            </div>
                        )}

                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="mt-3 hidden lg:flex items-center justify-center w-full py-1.5 text-gray-400 hover:text-green-700 transition-colors border border-transparent hover:border-gray-200 rounded"
                        >
                            {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {showingNavigationDropdown && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/40 lg:hidden"
                    onClick={() => setShowingNavigationDropdown(false)}
                ></div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-200 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                            className="lg:hidden p-2 text-gray-500 hover:text-green-700 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-base font-bold text-gray-900 uppercase">
                            {header || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded px-3 py-1.5 focus-within:ring-2 focus-within:ring-green-500/10 focus-within:border-green-500 transition-all">
                            <Search size={16} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search system..."
                                className="bg-transparent border-none text-sm focus:ring-0 placeholder:text-gray-400 font-medium ml-2 w-48"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="relative p-2 text-gray-500 hover:text-green-700 transition-colors">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-600 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="h-6 w-px bg-gray-200 hidden sm:block mx-1"></div>

                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 transition-colors">
                                            <div className="w-8 h-8 bg-green-700 rounded flex items-center justify-center text-white font-bold text-xs">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="hidden sm:block text-left">
                                                <p className="text-xs font-bold text-gray-900 uppercase leading-none mb-0.5">{user.name}</p>
                                                <p className="text-[10px] font-semibold text-gray-500 uppercase leading-none">Administrator</p>
                                            </div>
                                            <ChevronDown size={14} className="text-gray-400 ml-1" />
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content width="48">
                                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-0.5">Account</p>
                                            <p className="text-xs font-semibold text-gray-900 truncate">{user.email}</p>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2 text-sm">
                                            <UserIcon size={14} /> Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 text-sm text-red-600">
                                            <LogOut size={14} /> Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>

                {/* Footer */}
                <footer className="px-6 py-4 border-t border-gray-200 bg-white text-center">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} DENR PENRO Bulacan • Daily Time Record System
                    </p>
                </footer>
            </div>
        </div>
    );
}

