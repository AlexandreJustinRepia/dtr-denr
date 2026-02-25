import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { LayoutDashboard, FileText, User as UserIcon, Clock, ShieldCheck, Activity } from 'lucide-react';

export default function Dashboard({ stats }) {
    // Analytics chart calculation (find max for scaling)
    const maxLogs = Math.max(...stats.chartData.map(d => d.count), 50);

    return (
        <AuthenticatedLayout
            header="Overview"
        >
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Welcome Banner */}
                <div className="bg-green-700 rounded-[40px] p-10 relative overflow-hidden shadow-2xl shadow-green-900/20">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <p className="text-green-200 text-xs font-black uppercase tracking-[0.3em] mb-3">System Administrator</p>
                            <h3 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                                Welcome to the <br />
                                <span className="text-green-300">Command Center.</span>
                            </h3>
                            <p className="mt-4 text-green-100 text-lg font-medium max-w-lg opacity-80">
                                Monitor system health, manage personnel logs, and generate detailed attendance reports with precision.
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center min-w-[200px]">
                            <Activity className="text-green-300 mb-2 animate-pulse" size={32} />
                            <p className="text-white font-black text-3xl">99.9%</p>
                            <p className="text-green-300 text-[10px] font-bold uppercase tracking-widest">System Uptime</p>
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Logs', value: stats.totalLogs, sub: `+${stats.todayLogs} today`, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Employees', value: stats.personnelCount, sub: 'Active personnel', icon: UserIcon, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Attendance Rate', value: stats.attendanceRate, sub: 'Daily average', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
                        { label: 'Security Status', value: 'Protected', sub: 'Guard active', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                    <stat.icon size={24} />
                                </div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Live Updates</span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</h4>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-tight">{stat.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Section: Charts & Quick Actions */}
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-50 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-xl text-gray-800 uppercase tracking-tight">Log Frequency Analytics</h3>
                            <button className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20">
                                Last 7 Days
                            </button>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2 px-4">
                            {stats.chartData.map((data, i) => {
                                const heightPercent = (data.count / maxLogs) * 100;
                                return (
                                    <div key={i} className="flex-1 bg-green-50 rounded-t-xl relative group hover:bg-green-500/20 transition-all" style={{ height: `${Math.max(heightPercent, 5)}%` }}>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-20 shadow-xl">
                                            {data.count} Logs <span className="text-gray-400">({data.fullDate})</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            {stats.chartData.map(d => <span key={d.day}>{d.day}</span>)}
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm p-8">
                        <h3 className="font-black text-xl text-gray-800 uppercase tracking-tight mb-8">Quick Terminal</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'New Batch Upload', desc: 'Process biometric logs', color: 'bg-green-500', route: '/admin/dtr' },
                                { label: 'Log Search', desc: 'Check log inconsistencies', color: 'bg-blue-500', route: '/' },
                                { label: 'User Profile', desc: 'Manage your account', color: 'bg-orange-500', route: '/profile' },
                            ].map((action, i) => (
                                <a key={i} href={action.route} className="w-full group flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg transition-all text-left">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-2 h-2 rounded-full ${action.color}`}></div>
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{action.label}</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 italic">{action.desc}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all">
                                        <ArrowRight size={14} />
                                    </div>
                                </a>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-50">
                            <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">System Version 2.1.0-stable</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Add ArrowRight to imports if not already there, wait, I forgot to import it.
import { ArrowRight } from 'lucide-react';
