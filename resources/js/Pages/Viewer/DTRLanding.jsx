import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Download, User, Clock, AlertCircle, Building2, Loader2 } from 'lucide-react';
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

    // Handle selecting an employee to view DTR
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

    // Handle PDF download
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

    // Convert 24-hour time to 12-hour format
    const format12Hour = (time) => {
        if (!time) return '';
        let [hour, minute] = time.split(':').map(Number);
        hour = hour % 12 || 12;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    // Process raw logs into in/out/break times
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

    // Perform search/filter requests
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

    // Auto-fetch when filters change
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
        <>
            <Head title="PENRO Bulacan DTR PORTAL" />

            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-900 text-white py-8 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="bg-white p-3 rounded-full shadow-md">
                            <Building2 className="w-8 h-8 text-green-700" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">PENRO Bulacan</h1>
                            <p className="text-green-100 text-sm">Department of Environment and Natural Resources</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-green-100">Daily Time Record (DTR) Portal</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                <SearchFilters
                    search={search} setSearch={setSearch}
                    filterMonth={filterMonth} setFilterMonth={setFilterMonth}
                    filterYear={filterYear} setFilterYear={setFilterYear}
                    availableDates={availableDates}
                    handleKeyDown={handleKeyDown} handleSearch={handleSearch} handleReset={handleReset}
                    selectedEmployee={selectedEmployee} performRequest={performRequest}
                    status={status} setStatus={setStatus} loadingEmployees={loadingEmployees}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

                    <div className="lg:col-span-2">
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
            </div>

            <Footer />
        </>
    );
}
