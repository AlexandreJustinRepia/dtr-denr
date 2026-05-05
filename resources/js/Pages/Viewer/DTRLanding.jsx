import { Head, router, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Download, User, Users, Clock, AlertCircle, Building2, Loader2, Zap, ShieldCheck, LayoutDashboard } from 'lucide-react';
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
            <header className="bg-green-800 pt-8 pb-12 px-6 text-white border-b-4 border-green-600">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div className="flex items-center gap-4 mb-6 md:mb-0">
                        <div className="bg-white p-3 rounded shadow-sm">
                            <Building2 className="w-8 h-8 text-green-800" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck size={14} className="text-green-200" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-green-100">Department of Environment and Natural Resources</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">PENRO Bulacan</h1>
                            <p className="text-sm font-medium text-green-50">Daily Time Record System</p>
                            
                            <div className="flex gap-4 mt-4">
                                <div className="bg-green-900/40 px-3 py-1.5 rounded flex items-center gap-2 border border-green-700/50">
                                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100/80 leading-none mb-0.5">Permanent</p>
                                        <p className="text-sm font-semibold leading-none">{stats?.permanent || 0}</p>
                                    </div>
                                </div>
                                <div className="bg-green-900/40 px-3 py-1.5 rounded flex items-center gap-2 border border-green-700/50">
                                    <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-100/80 leading-none mb-0.5">Job Order</p>
                                        <p className="text-sm font-semibold leading-none">{stats?.jo || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-4 md:mt-0">
                        <Link 
                            href={route('dashboard')}
                            className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold shadow-sm hover:bg-green-600 border border-green-600 transition-colors"
                        >
                            <LayoutDashboard size={16} />
                            System Dashboard
                        </Link>
                        <Link 
                            href={route('employees.index')}
                            className="inline-flex items-center gap-2 bg-white text-green-800 px-4 py-2 rounded text-sm font-semibold shadow-sm hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                        >
                            <Users size={16} />
                            Manage Personnel
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 relative z-20">
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                    <div className="lg:col-span-4 lg:border-r border-gray-200 lg:pr-6">
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
