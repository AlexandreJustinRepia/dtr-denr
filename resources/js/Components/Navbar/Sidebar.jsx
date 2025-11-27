import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function SidebarAuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { label: "Dashboard", route: "dashboard" },
        { label: "Generate", route: "dtr" },
        { label: "Users", route: "users.index" },
        { label: "Reports", route: "reports.index" },
    ];

    return (
        <div className="min-h-screen flex bg-gray-100">

            {/* Mobile sidebar overlay */}
            <div
                className={`${sidebarOpen ? "block" : "hidden"} fixed inset-0 z-30 bg-black/40 lg:hidden`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`fixed z-40 inset-y-0 left-0 w-64 bg-white border-r transform transition-transform duration-200 
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
                
                <div className="flex items-center justify-between px-4 h-16 border-b">
                    <Link href="/">
                        <ApplicationLogo className="h-9 w-auto text-gray-800" />
                    </Link>
                    <button
                        className="lg:hidden text-gray-600"
                        onClick={() => setSidebarOpen(false)}
                    >
                        ✕
                    </button>
                </div>

                <nav className="mt-6 space-y-1 px-4">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.route}
                            href={route(item.route)}
                            active={route().current(item.route)}
                            className="block"
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full border-t p-4">
                    <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                    <form method="POST" action={route("logout")} className="mt-2">
                        <button type="submit" className="text-red-600 text-sm hover:underline">
                            Log Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col lg:ml-64">
                {/* Top bar */}
                <header className="flex h-16 bg-white border-b items-center px-4 shadow-sm">
                    <button
                        className="lg:hidden text-gray-600"
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰
                    </button>
                    <div className="ml-4 flex-1">
                        {header}
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
