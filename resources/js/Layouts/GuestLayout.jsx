import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#f8fafc] pt-6 sm:justify-center sm:pt-0 border-t-8 border-green-600">
            <div className="mb-4 transition-transform hover:scale-105 duration-300">
                <Link href="/">
                    <ApplicationLogo className="h-24 w-24" />
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-10 py-12 bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-gray-200/50 sm:rounded-[40px] overflow-hidden transition-all duration-500 hover:shadow-green-900/5">
                {children}
            </div>
        </div>
    );
}
