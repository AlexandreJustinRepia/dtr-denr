import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Download, User, Clock, AlertCircle, Building2, Loader2, Zap, ShieldCheck } from 'lucide-react';
import Footer from '@/Components/Footer';
import SearchFilters from './Components/SearchFilter';
import EmployeeList from './Components/EmployeeList';
import DTRRecords from "./Components/DTRRecords";
import axios from 'axios';

export default function DTRLanding({ employees, filters, availableDates }) {
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

    const format12Hour = (time) => {
        if (!time) return '';
        let [hour, minute] = time.split(':').map(Number);
        hour = hour % 12 || 12;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    const processLogs = (logs) => {
        if (!logs || logs.length === 0) return { inTime: '', breakOut: '', breakIn: '', outTime: '' };
        const times = logs.map(l => l.time).sort();
        let inTime = '', breakOut = '', breakIn = '', outTime = '';

        times.forEach(time => {
            const [h, m] = time.split(':').map(Number);
            const hm = h + m / 60;
            if (hm >= 5 && hm < 12 && !inTime) inTime = time;
            if (hm >= 12 && hm < 13 && !breakOut) breakOut = time;
            if (breakOut && hm >= 12 && hm < 14 && !breakIn && time !== breakOut) breakIn = time;
            if (hm >= 13) outTime = time;
        });

        return { inTime, breakOut, breakIn, outTime };
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
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 mb-2">
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
                            processLogs={processLogs}
                            format12Hour={format12Hour}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
