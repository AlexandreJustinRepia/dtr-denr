import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { LayoutDashboard, FileText, User as UserIcon, Clock, ShieldCheck, Activity, ArrowRight } from 'lucide-react';

export default function Dashboard({ stats }) {
    // Analytics chart calculation (find max for scaling)
    const maxLogs = Math.max(...stats.chartData.map(d => d.count), 50);

    return (
        <AuthenticatedLayout
            header="Overview"
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">System Administrator</p>
                            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                                Dashboard Overview
                            </h3>
                            <p className="mt-2 text-gray-600 text-sm max-w-2xl">
                                Monitor system health, manage personnel logs, and generate detailed attendance reports.
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded border border-gray-200 p-4 flex flex-col items-center justify-center min-w-[160px]">
                            <Activity className="text-green-600 mb-1" size={24} />
                            <p className="text-gray-900 font-bold text-2xl">99.9%</p>
                            <p className="text-gray-500 text-xs font-semibold uppercase mt-1">System Uptime</p>
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Logs', value: stats.totalLogs, sub: `+${stats.todayLogs} today`, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Employees', value: stats.personnelCount, sub: 'Active personnel', icon: UserIcon, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Attendance Rate', value: stats.attendanceRate, sub: 'Daily average', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
                        { label: 'Security Status', value: 'Protected', sub: 'Guard active', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded border border-gray-200 shadow-sm flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`${stat.bg} ${stat.color} p-3 rounded`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-xs font-semibold text-gray-400 uppercase">Live Updates</span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{stat.label}</h4>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-xs font-semibold text-green-600">{stat.sub}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Section: Charts & Quick Actions */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-base text-gray-800 uppercase tracking-wide">Log Frequency Analytics</h3>
                            <button className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded text-xs font-semibold border border-gray-300 transition-colors">
                                Last 7 Days
                            </button>
                        </div>
                        <div className="h-48 flex items-end justify-between gap-2">
                            {stats.chartData.map((data, i) => {
                                const heightPercent = (data.count / maxLogs) * 100;
                                return (
                                    <div key={i} className="flex-1 bg-green-50 hover:bg-green-100 border-t border-x border-green-200 rounded-t relative group transition-colors" style={{ height: `${Math.max(heightPercent, 5)}%` }}>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-sm">
                                            {data.count} Logs <span className="text-gray-300">({data.fullDate})</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-3 text-xs font-semibold text-gray-500 uppercase">
                            {stats.chartData.map(d => <span key={d.day}>{d.day}</span>)}
                        </div>
                    </div>

                    <div className="bg-white rounded border border-gray-200 shadow-sm p-6 flex flex-col">
                        <h3 className="font-bold text-base text-gray-800 uppercase tracking-wide mb-6">Quick Terminal</h3>
                        <div className="space-y-3 flex-1">
                            {[
                                { label: 'New Batch Upload', desc: 'Process biometric logs', route: '/admin/dtr' },
                                { label: 'Log Search', desc: 'Check log inconsistencies', route: '/' },
                                { label: 'User Profile', desc: 'Manage your account', route: '/profile' },
                            ].map((action, i) => (
                                <a key={i} href={action.route} className="block group p-4 rounded bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 transition-colors text-left">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 mb-0.5">{action.label}</p>
                                            <p className="text-xs text-gray-500">{action.desc}</p>
                                        </div>
                                        <div className="text-gray-400 group-hover:text-green-600 transition-colors">
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                            <p className="text-xs text-gray-500">System Version 2.1.0-stable</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
