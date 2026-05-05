import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#f8fafc] pt-6 sm:justify-center sm:pt-0">
            <div className="mb-4">
                <Link href="/">
                    <ApplicationLogo className="h-24 w-24" />
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-white border border-gray-200 shadow-sm sm:rounded overflow-hidden">
                {children}
            </div>
        </div>
    );
}
