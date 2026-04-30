import { Head, router, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Download, User, Users, Clock, AlertCircle, Building2, Loader2, Zap, ShieldCheck } from 'lucide-react';
import Footer from '@/Components/Footer';
import SearchFilters from './Components/SearchFilter';
import EmployeeList from './Components/EmployeeList';
import DTRRecords from "./Components/DTRRecords";
import axios from 'axios';

export default function DTRLanding({ employees, filters, availableDates, stats }) {
    const dtrRef = useRef(null);
    const dtrContentRef = useRef(null);

    const today = new Date();
    const currentMonth = filters?.month || today.getMonth() + 1;
    const currentYear = filters?.year || today.getFullYear();

    const [search, setSearch] = useState(filters?.search || '');
    const [filterMonth, setFilterMonth] = useState(currentMonth);
    const [filterYear, setFilterYear] = useState(currentYear);
    const [status, setStatus] = useState(filters?.status || '');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [records, setRecords] = useState({});
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [dtrLoading, setDtrLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState({});

    const employeeList = employees.data;

    const handleEmployeeSelect = async (employeeName) => {
        setSelectedEmployee(employeeName);
        setDtrLoading(true);
        try {
            const res = await axios.get(`/fetch-dtr/${encodeURIComponent(employeeName)}/${filterMonth}/${filterYear}?status=${status}`);
            setRecords({ [employeeName]: res.data.records });
        } catch (err) {
            console.error(err);
            alert('Failed to load DTR.');
        } finally {
            setDtrLoading(false);
        }
    };

    const handleDownload = async (employeeName, month) => {
        const key = `${employeeName}-${month}`;
        setDownloadLoading(prev => ({ ...prev, [key]: true }));

        try {
            const response = await fetch(`/generate-dtr/${encodeURIComponent(employeeName)}/${month}`, {
                method: 'GET',
                headers: { 'Accept': 'application/pdf' },
            });
            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${employeeName.replace(/ /g, '_')}_DTR_${month}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error(error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloadLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleDownloadDocx = async (employeeName, month) => {
        const key = `${employeeName}-${month}-docx`;
        setDownloadLoading(prev => ({ ...prev, [key]: true }));

        try {
            const response = await fetch(`/generate-dtr-docx/${encodeURIComponent(employeeName)}/${month}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                },
            });

            if (!response.ok) throw new Error('Failed to generate DOCX');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${employeeName.replace(/ /g, '_')}_DTR_${month}.docx`;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error(error);
            alert('Failed to generate DOCX. Please try again.');
        } finally {
            setDownloadLoading(prev => ({ ...prev, [key]: false }));
        }
    };
    const handleBulkDownload = async () => {
        if (!status) {
            alert('Please select an employment status (Permanent or JO) first.');
            return;
        }

        const key = `bulk-${status}-${filterMonth}-${filterYear}`;
        setDownloadLoading(prev => ({ ...prev, [key]: true }));

        try {
            // Using window.location.href is more reliable for large file downloads 
            // as it handles authentication cookies and streaming automatically.
            window.location.href = `/generate-bulk-dtr/${filterMonth}/${filterYear}/${status}`;
            
            // We set a timeout to clear the loading state since we can't detect when the download starts
            setTimeout(() => {
                setDownloadLoading(prev => ({ ...prev, [key]: false }));
            }, 3000);
            return;
        } catch (error) {
            console.error(error);
            alert('Failed to initiate bulk download. Please try again.');
            setDownloadLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const updateSchedule = async (employee, date, type) => {
        try {
            await axios.post('/update-schedule', { employee, date, type });
            handleEmployeeSelect(employee);
        } catch (err) {
            console.error(err);
            alert('Failed to update schedule.');
        }
    };

    const format12Hour = (time) => {
        if (!time) return '';
        const timeStr = typeof time === 'object' ? time.time : time;
        let [hour, minute] = timeStr.split(':').map(Number);
        hour = hour % 12 || 12;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    const updateLogTime = async (id, time, employeeName) => {
        try {
            await axios.post('/update-log-time', { id, time });
            handleEmployeeSelect(employeeName);
        } catch (err) {
            console.error(err);
            alert('Failed to update time.');
        }
    };

    const processLogs = (logs) => {
        if (!logs || logs.length === 0) return { inTime: null, breakOut: null, breakIn: null, outTime: null };
        const sortedLogs = [...logs].sort((a, b) => a.time.localeCompare(b.time));
        let inTime = null, breakOut = null, breakIn = null, outTime = null;

        sortedLogs.forEach(log => {
            const [h, m] = log.time.split(':').map(Number);
            const hm = h + m / 60;
            if (hm >= 5 && hm < 12 && !inTime) inTime = log;
            if (hm >= 12 && hm < 13 && !breakOut) breakOut = log;
            if (breakOut && hm >= 12 && hm < 14 && !breakIn && log.time !== breakOut.time) breakIn = log;
            if (hm >= 13) outTime = log;
        });

        return { inTime, breakOut, breakIn, outTime };
    };

    const handleDeleteMonth = async (employee, month) => {
        if (!confirm(`Are you sure you want to delete all records for ${employee} in ${month}?`)) return;
        
        try {
            await axios.post('/delete-month-records', { employee, month });
            handleEmployeeSelect(employee);
        } catch (err) {
            console.error(err);
            alert('Failed to delete records.');
        }
    };

    const performRequest = ({ searchValue, monthValue, yearValue, statusValue, updateList = true }) => {
        if (updateList) setLoadingEmployees(true);
        else setDtrLoading(true);

        router.get(
            route('dtr.view'),
            { search: searchValue || '', month: monthValue, year: yearValue, status: statusValue },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => {
                    if (updateList) setLoadingEmployees(false);
                    else setDtrLoading(false);
                },
            }
        );
    };

    useEffect(() => {
        if (selectedEmployee) {
            handleEmployeeSelect(selectedEmployee);
        } else {
            performRequest({
                searchValue: search,
                monthValue: filterMonth,
                yearValue: filterYear,
                statusValue: status,
                updateList: true
            });
        }
    }, [filterMonth, filterYear, status]);

    const handleSearch = () => performRequest({ searchValue: search, monthValue: filterMonth, yearValue: filterYear, statusValue: status });
    const handleKeyDown = (e) => e.key === 'Enter' && handleSearch();
    const handleReset = () => {
        setSearch(''); setFilterMonth(currentMonth); setFilterYear(currentYear); setStatus(''); setSelectedEmployee(null);
        performRequest({ searchValue: '', monthValue: currentMonth, yearValue: currentYear, statusValue: '', updateList: true });
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-green-100 selection:text-green-900">
            <Head title="Employee DTR Portal | PENRO Bulacan" />

            {/* Header Hero */}
            <header className="bg-green-700 pt-12 pb-24 px-6 relative overflow-hidden text-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
                    <div className="flex items-center gap-6 mb-8 md:mb-0">
                        <div className="bg-white p-4 rounded-3xl shadow-xl shadow-green-900/20">
                            <Building2 className="w-10 h-10 text-green-700" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck size={14} className="text-green-100" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Official Portal</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-1">PENRO Bulacan</h1>
                            <p className="text-sm font-bold uppercase tracking-widest text-green-50 italic">Matrix DTR Access Point</p>
                            
                            <div className="flex gap-3 mt-6">
                                <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/20 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-100/70 leading-none mb-1">Permanent</p>
                                        <p className="text-lg font-black leading-none">{stats?.permanent || 0}</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/20 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-100/70 leading-none mb-1">Job Order</p>
                                        <p className="text-lg font-black leading-none">{stats?.jo || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center md:text-right flex flex-col items-center md:items-end gap-3">
                        <Link 
                            href={route('employees.index')}
                            className="inline-flex items-center gap-2 bg-white text-green-700 px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-green-900/20 hover:bg-green-50 transition-all active:scale-95"
                        >
                            <Users size={14} />
                            Manage Personnel
                        </Link>
                        
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-white/90">Attendance Server Online</span>
                        </div>
                        <p className="text-white font-bold uppercase tracking-widest text-xs opacity-80">Daily Time Record Retrieval</p>
                    </div>
                </div>

                {/* Abstract Background Decor */}
                <Zap className="absolute -right-20 -bottom-20 text-white/5" size={400} />
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto -mt-16 px-6 pb-20 relative z-20">
                <SearchFilters
                    search={search} setSearch={setSearch}
                    filterMonth={filterMonth} setFilterMonth={setFilterMonth}
                    filterYear={filterYear} setFilterYear={setFilterYear}
                    availableDates={availableDates}
                    handleKeyDown={handleKeyDown} handleSearch={handleSearch} handleReset={handleReset}
                    selectedEmployee={selectedEmployee} performRequest={performRequest}
                    status={status} setStatus={setStatus} loadingEmployees={loadingEmployees}
                    handleBulkDownload={handleBulkDownload}
                    downloadLoading={downloadLoading}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
                    <div className="lg:col-span-4">
                        <EmployeeList
                            employeeList={employeeList}
                            selectedEmployee={selectedEmployee}
                            setSelectedEmployee={handleEmployeeSelect}
                            employees={employees}
                            search={search}
                            filterMonth={filterMonth}
                            filterYear={filterYear}
                            router={router}
                            status={status}
                            loadingEmployees={loadingEmployees}
                        />
                    </div>

                    <div className="lg:col-span-8">
                        <DTRRecords
                            selectedEmployee={selectedEmployee}
                            dtrLoading={dtrLoading}
                            records={records}
                            downloadLoading={downloadLoading}
                            handleDownload={handleDownload}
                            handleDownloadDocx={handleDownloadDocx}
                            updateSchedule={updateSchedule}
                            updateLogTime={updateLogTime}
                            processLogs={processLogs}
                            format12Hour={format12Hour}
                            handleDeleteMonth={handleDeleteMonth}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
