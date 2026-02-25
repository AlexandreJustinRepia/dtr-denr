import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50/50 pt-6 sm:justify-center sm:pt-0">
            <div className="mb-4 transition-transform hover:scale-105 duration-300">
                <Link href="/">
                    <ApplicationLogo className="h-24 w-24" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-8 py-8 shadow-xl shadow-gray-200/50 border border-gray-100 sm:max-w-md sm:rounded-2xl transition-all">
                {children}
            </div>
        </div>
    );
}
