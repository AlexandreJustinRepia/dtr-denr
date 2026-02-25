import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { LayoutDashboard, LogIn, UserPlus, Clock, FileText, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-[#f8fafc] selection:bg-green-500 selection:text-white font-sans antialiased text-gray-900 border-t-8 border-green-600">
            <Head title="Welcome" />

            {/* Header Navigation */}
            <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ApplicationLogo className="h-14 w-auto drop-shadow-sm" />
                    <div className="hidden sm:block">
                        <p className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tighter">DENR Bulacan</p>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em]">DTR Management System</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-green-600/20 active:scale-95"
                        >
                            <LayoutDashboard size={18} />
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="text-gray-600 hover:text-green-600 font-bold px-4 py-2 transition-colors flex items-center gap-2"
                            >
                                <LogIn size={18} />
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-green-600 hover:text-green-600 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                            >
                                <UserPlus size={18} />
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10">
                        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight">
                            Effortless <span className="text-green-600">Attendance</span> Tracking for DENR Bulacan.
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-500 mb-10 leading-relaxed max-w-xl">
                            Convert complex biometric logs into structured Daily Time Records with a single click. High-end, minimalist tool built for accuracy.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <Link
                                href={auth.user ? route('dashboard') : route('login')}
                                className="group inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-5 rounded-2xl font-black text-lg transition-all hover:shadow-xl hover:shadow-green-600/30 active:scale-95"
                            >
                                Start Generating Now
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <div className="flex items-center gap-3 px-6">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-green-${200 + i * 100}`}></div>
                                    ))}
                                </div>
                                <p className="text-sm font-bold text-gray-400">Trusted by DENR Personnel</p>
                            </div>
                        </div>
                    </div>

                    {/* Visual Decor */}
                    <div className="relative hidden lg:block">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-600/5 rounded-full blur-3xl animate-pulse"></div>
                        <div className="bg-white rounded-[40px] shadow-2xl p-8 border border-gray-100 relative z-10 scale-110">
                            <div className="space-y-4 mb-8">
                                <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse"></div>
                                <div className="h-4 bg-gray-50 rounded-full w-1/2 animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-32 bg-green-50 p-6 rounded-3xl flex flex-col justify-end">
                                    <Clock className="text-green-600 mb-2" />
                                    <div className="h-2 bg-green-200 rounded-full w-1/2"></div>
                                </div>
                                <div className="h-32 bg-gray-50 p-6 rounded-3xl flex flex-col justify-end">
                                    <FileText className="text-gray-400 mb-2" />
                                    <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Feature Cards */}
            <section className="bg-white py-24 mb-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.3em] mb-4">Features</p>
                        <h2 className="text-3xl font-black text-gray-900">Precision built for everyone.</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'Lightning Fast', desc: 'Paste raw logs and see structured DTR data instantly.', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { title: 'Secure Admin', desc: 'Manage batch logs and review histories in one place.', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
                            { title: 'Smart Parsing', desc: 'Automatically handles breaks, AM/PM, and weekdays.', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' }
                        ].map((feat, i) => (
                            <div key={i} className="p-10 rounded-3xl border border-gray-50 hover:border-green-100 transition-all hover:bg-green-50/20 group">
                                <div className={`${feat.bg} ${feat.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                                    <feat.icon size={28} />
                                </div>
                                <h3 className="text-xl font-black text-gray-800 mb-3">{feat.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="py-20 text-center text-gray-400 font-bold text-xs border-t border-gray-50 bg-[#f8fafc]">
                &copy; {new Date().getFullYear()} DENR Provincial Environment and Natural Resources Office - Bulacan.
            </footer>
        </div>
    );
}
