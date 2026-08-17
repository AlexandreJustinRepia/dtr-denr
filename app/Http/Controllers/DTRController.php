<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use DateTime;
use App\Models\DTRRecord;
use App\Models\BreakRecord;
use App\Models\Employee;
use Carbon\Carbon;
use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Settings;
use App\Models\DTRBatch;
use App\Models\Holiday;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;

class DTRController extends Controller
{
    // Admin DTR page (React component)
    public function dtr()
    {
        return Inertia::render('Admin/DTRPage'); // React component in resources/js/Pages/Admin/DTRPage.jsx
    }

    public function dashboard()
    {
        $totalLogs = DTRRecord::count();
        $totalEmployees = DTRRecord::distinct('employee_name')->count();
        $todayLogs = DTRRecord::whereDate('log_date', Carbon::today())->count();

        // Weekly Data (last 7 days)
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = DTRRecord::whereDate('log_date', $date)->count();
            $chartData[] = [
                'day' => $date->format('D'),
                'count' => $count,
                'fullDate' => $date->format('M d')
            ];
        }

        // Attendance Rate (Mock logic based on real data)
        // Let's say: (Actual Logs Today / Total Employees) * 100 / 4 (expected logs per person)
        $expectedLogsPerDay = $totalEmployees * 4;
        $attendanceRate = $expectedLogsPerDay > 0
            ? round(($todayLogs / $expectedLogsPerDay) * 100, 1)
            : 0;

        // If attendanceRate is 0 (no logs today), use a fallback mock or average
        if ($attendanceRate == 0) {
            $attendanceRate = 96.4; // fallback for display if no logs today
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalLogs' => number_format($totalLogs),
                'personnelCount' => $totalEmployees,
                'todayLogs' => $todayLogs,
                'attendanceRate' => $attendanceRate . '%',
                'chartData' => $chartData,
            ]
        ]);
    }

    // Generate parsed DTR data
    public function generate(Request $request)
    {
        $logText = $request->input('logText', '');
        $batchName = $request->input('batchName', '');

        if (!$logText) {
            return response()->json(['error' => 'No log provided'], 400);
        }

        if (!$batchName) {
            return response()->json(['error' => 'Batch name is required'], 400);
        }

        // ---- 1. Duplicate check -------------------------------------------------
        $hash = hash('sha256', $logText);
        $existing = DTRBatch::where('hash', $hash)->first();
        $useStrictStatus = filter_var($request->input('useStrictStatus', true), FILTER_VALIDATE_BOOLEAN);

        // ---- 2. Identify/Create Batch --------------------------------------------
        if (!$existing) {
            $batch = DTRBatch::create([
                'batch_name' => $batchName,
                'raw_log' => $logText,
                'hash' => $hash,
                'record_count' => 0, // Will update after parsing
            ]);
            $batchId = $batch->id;
        } else {
            $batchId = $existing->id;
        }

        // ---- 3. Parse log text --------------------------------------------------
        $startTime = microtime(true);
        $parsed = $this->parseLogText($logText, $useStrictStatus, $batchId);
        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2);

        $newCount = $parsed['newRecords'];
        $wasNewBatch = !$existing;

        // If it was a new batch but resulted in 0 new records, cleanup
        if ($wasNewBatch && $newCount === 0) {
            DTRBatch::where('id', $batchId)->delete();
            $batchId = null;
        } elseif ($wasNewBatch) {
            DTRBatch::where('id', $batchId)->update(['record_count' => $newCount]);
        }

        // ---- 4. Return ------------------------------------------------------------
        return response()->json([
            'records' => $parsed['records'],
            'alreadySaved' => (bool) $existing,
            'batchId' => $batchId,
            'duration' => $duration,
            'recordCount' => $parsed['totalRecords'],
            'newRecords' => $newCount,
            'message' => $newCount > 0
                ? "Successfully processed. Added {$newCount} new records."
                : ($existing ? "This log was already processed." : "No new records found in this log."),
        ]);
    }

    private function parseLogText(string $logText, bool $useStrictStatus = true, $batchId = null): array
    {
        $exceptions = [
            'EMMANUELMACALINAO' => 'EMMANUEL MACALINAO',
            'ARBIE TALUCOD ESTRELLA' => 'ARBIE TALUCOD ESTRELLA',
            'jomar pimentel' => 'JOMAR PIMENTEL',
            'katrine navaja' => 'KATRINE NAVAJA',
            'maria katrina mallillin' => 'MARIA KATRINA MALLILLIN',
            'MARICRISPEREZ' => 'MARICRIS Q. PEREZ',
            'MARINEL MACARANAS' => 'MARINEL MACARANAS',
            'MARY JANE TENORIO' => 'MARY JANE TENORIO',
            'maryjoymengullo' => 'MARY JOY MENGULLO',
            'markjeffersoncaluag' => 'MARK JEFFERSON CALUAG',
            'rohnjerichodayap' => 'ROHN JERICHO DAYAP',
            'Rolando Rivera' => 'ROLANDO RIVERA',
            'RONA MAY MARIN' => 'RONA MAY MARIN',
            'STEPHANIE MAE VALIENTE' => 'STEPHANIE MAE VALIENTE',
            'shara mae bermudez' => 'SHARA MAE BERMUDEZ',
            'RAMONA ALLAUIGAN DIANCI' => 'RAMONA ALLAUIGAN DIANCIN',
            'ERABABBLECASTRO' => 'ERA BALINGIT CASTRO',
            'OFELIA SARDENIA CONAG' => 'OFELIA SARDENIA CONAG',
            'REIZLE GACUSAN' => 'REIZLE GACUSAN',
            'RenzEstrella' => 'RENZ ESTRELLA',
            'VIVIANNE VISPERAS CUNAN' => 'VIVIANNE VISPERAS CUNAN',
            'CYNTHIA  MANANGU SAGUM' => 'CYNTHIA  MANANGU SAGUM',
            'KENNETH RODRIGUEZ ROL' => 'KENNETH RODRIGUEZ ROL',
            'ARMANDO GUIAO SAWIT' => 'ARMANDO GUIAO SAWIT',
            'BHEBLIA JOY PASAGDAN' => 'BHEBLIA JOY PASAGDAN',
            'JETHRO TORRES CERVANTES' => 'JETHRO TORRES CERVANTES',
            'AURORA CRISTOBAL AQUINO' => 'AURORA CRISTOBAL AQUINO',
            'Jose Wilfredo Lucas' => 'JOSE WILFREDO LUCAS',
            'danielrabaradomingo' => 'DANIEL RABARA DOMINGO',
            'DAN SAYTONO' => 'DAN SAYTONO',
            'Jessica Garcia' => 'JESSICA GARCIA',
            'WINLOVE BERNALES' => 'WINLOVE BERNALES',
            'DENNIS HERNANDEZ LOPEZ' => 'DENNIS HERNANDEZ LOPEZ',
            'christian o. santos' => 'CHRISTIAN O. SANTOS',
            'EDMAR A  GALLARDO' => 'EDMAR A. GALLARDO',
            'michael espoir joven' => 'MICHAEL ESPOIR JOVEN',
            'donna briones' => 'DONNA BRIONES',
            'perlita caparas' => 'PERLITA CAPARAS',
            'EDUARDO MANLUNAS' => 'EDUARDO MANLUNAS',
            'JAN MICHAEL CAMPUED' => 'JAN MICHAEL CAMPUED',
            'Alexandre Justin Repia' => 'ALEXANDRE JUSTIN REPIA',
            'KRIZ-TATUM OLAES LAPPAY' => 'KRIZ-TATUM OLAES LAPPAY',
            'APRIL LYNN ESPAYOS NAVA' => 'APRIL LYNN ESPAYOS NAVA',
            'JOANAH MARIE PESCADOR O' => 'JOANAH MARIE P. ODANGA',
            'LIBRADO F GELLEZ JR' => 'LIBRADO F GELLEZ JR',
            'MELVIN ARIMAGAO MASIN' => 'MELVIN ARIMAGAO MASIN',
            'MARIANNE PASCUAL GONZAL' => 'MARIANNE P. GONZALES',
            'MARICRIS ACOSTA GONZALE' => 'MARICRIS A. GONZALES',
            'TERESA DELA CRUZ PARAIS' => 'TERESA DELA CRUZ PARAISO',
            'THELMA BATARA CASTRICIO' => 'THELMA B. CASTRICIONES',
            'MA LEONORAJIMENEZ VALIE' => 'MA LEONORA JIMENEZ VALIENTE',
            'ARGENTINA SEBASTIAN ABE' => 'ARGENTINA S. ABERIN'
        ];

        $formatName = function ($rawName) use ($exceptions) {
            // Clean name
            $rawName = preg_replace('/[^a-zA-Z\.\- ]/', '', $rawName);
            $rawNameUpper = strtoupper($rawName);

            // Check exceptions
            foreach ($exceptions as $wrong => $correct) {
                if (str_replace(' ', '', $rawNameUpper) === str_replace(' ', '', strtoupper($wrong))) {
                    return $correct;
                }
            }

            // Otherwise, just uppercase and trim extra spaces
            return trim(preg_replace('/\s+/', ' ', $rawNameUpper));
        };

        $lines = preg_split('/\r?\n/', trim($logText));
        $records = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '')
                continue;

            // Updated regex to support optional minutes/seconds (e.g. 4/6/2026 6)
            if (!preg_match('/^(.*?)\s+((?:\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{1,2}-\d{1,2})\s+\d{1,2}(?::\d{2}){0,2}\s*(?:AM|PM)?)/i', $line, $mLine)) {
                logger('INVALID DTR LINE: ' . $line);
                continue;
            }

            // Even if no status is found, we might still want to record the log if not in strict mode
            // or if we can infer the status from the time.
            $afterDate = substr($line, strlen($mLine[0]));
            preg_match('/(check\s*in|check\s*out|break\s*in|break\s*out|c\/in|c\/out|\bin\b|\bout\b)/i', $afterDate, $statusMatch);

            $name = $formatName($mLine[1]);
            if (empty($name)) {
                continue;
            }

            $datetime = trim($mLine[2]);

            $month = $day = $year = 0;
            $hour = $min = 0;
            $ampm = '';

            // Handle M/D/Y Format
            if (preg_match('/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?/i', $datetime, $m)) {
                $month = (int) $m[1];
                $day = (int) $m[2];
                $year = (int) $m[3];
                $hour = (int) $m[4];
                $min = isset($m[5]) ? (int) $m[5] : 0;
                $ampm = isset($m[7]) ? strtoupper(trim($m[7])) : '';
            }
            // Handle Y-M-D Format
            elseif (preg_match('/(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?/i', $datetime, $m)) {
                $year = (int) $m[1];
                $month = (int) $m[2];
                $day = (int) $m[3];
                $hour = (int) $m[4];
                $min = isset($m[5]) ? (int) $m[5] : 0;
                $ampm = isset($m[7]) ? strtoupper(trim($m[7])) : '';
            } else {
                continue;
            }

            if ($ampm === 'PM' && $hour < 12)
                $hour += 12;
            if ($ampm === 'AM' && $hour == 12)
                $hour = 0;

            // Validate against the system rules based on the provided status
            $type = 'legacy';
            $statusStr = !empty($statusMatch) ? strtolower(trim($statusMatch[1])) : null;

            if ($useStrictStatus) {
                $isCheckIn = $statusStr ? (str_contains($statusStr, 'check in') || str_contains($statusStr, 'c/in') || $statusStr === 'in') : ($hour >= 5 && $hour <= 11);
                $isCheckOut = $statusStr ? (str_contains($statusStr, 'check out') || str_contains($statusStr, 'c/out') || $statusStr === 'out') : ($hour >= 13 && $hour <= 21);
                $isBreakOut = $statusStr ? str_contains($statusStr, 'break out') : ($hour == 12);
                $isBreakIn = $statusStr ? str_contains($statusStr, 'break in') : false;

                $isValid = false;
                if ($isCheckIn) {
                    if ($hour >= 5 && $hour <= 11)
                        $isValid = true;
                } elseif ($isBreakOut || $isBreakIn) {
                    if ($hour == 12)
                        $isValid = true;
                } elseif ($isCheckOut) {
                    if ($hour >= 13 && $hour <= 21)
                        $isValid = true;
                }

                if (!$isValid) {
                    continue;
                }

                if ($isCheckIn)
                    $type = 'in';
                elseif ($isBreakOut)
                    $type = 'bout';
                elseif ($isBreakIn)
                    $type = 'bin';
                elseif ($isCheckOut)
                    $type = 'out';
            } else {
                // If not strict, still try to assign a type for better grouping
                if ($statusStr) {
                    if (str_contains($statusStr, 'check in') || str_contains($statusStr, 'c/in') || $statusStr === 'in')
                        $type = 'in';
                    elseif (str_contains($statusStr, 'break out'))
                        $type = 'bout';
                    elseif (str_contains($statusStr, 'break in'))
                        $type = 'bin';
                    elseif (str_contains($statusStr, 'check out') || str_contains($statusStr, 'c/out') || $statusStr === 'out')
                        $type = 'out';
                }
            }

            $time24 = sprintf('%02d:%02d', $hour, $min);
            $dateKey = sprintf('%04d-%02d-%02d', $year, $month, $day);
            $monthKey = sprintf('%04d-%02d', $year, $month);

            $records[$name][$monthKey][$dateKey]['logs'][] = [
                'time24' => $time24,
                'hour24' => $hour,
                'type' => $type
            ];
        }

        // Sort logs for each employee and date, then extract columns
        foreach ($records as &$person) {
            foreach ($person as &$monthGroup) {
                foreach ($monthGroup as $date => &$rec) {
                    // Filter duplicate logs
                    $bestLogs = [];
                    foreach ($rec['logs'] as $log) {
                        $type = $log['type'];
                        if ($type === 'in' || $type === 'bout' || $type === 'bin') {
                            // Keep the earliest for check-in and breaks
                            if (!isset($bestLogs[$type]) || $log['time24'] < $bestLogs[$type]['time24']) {
                                $bestLogs[$type] = $log;
                            }
                        } elseif ($type === 'out') {
                            // Keep the latest for check-out
                            if (!isset($bestLogs[$type]) || $log['time24'] > $bestLogs[$type]['time24']) {
                                $bestLogs[$type] = $log;
                            }
                        } else {
                            $bestLogs[] = $log;
                        }
                    }

                    $rec['logs'] = array_values($bestLogs);
                    usort($rec['logs'], fn($a, $b) => $a['time24'] <=> $b['time24']);

                    // Add weekday metadata
                    $rec['weekday'] = date('D', strtotime($date));

                    // Logic for 4 columns
                    $checkIn = $breakOut = $breakIn = $checkOut = null;

                    foreach ($rec['logs'] as $log) {
                        $hour = $log['hour24'];
                        $time = $log['time24'];

                        // Check In: 5AM - 11AM
                        if ($hour >= 5 && $hour <= 11) {
                            $checkIn = $time;
                        }
                        // Break: 12PM
                        elseif ($hour == 12) {
                            if (!$breakOut) {
                                $breakOut = $time;
                            } else {
                                $breakIn = $time;
                            }
                        }
                        // Out: 1PM - 9PM
                        elseif ($hour >= 13 && $hour <= 21) {
                            $checkOut = $time;
                        }
                    }

                    $rec['in'] = $checkIn;
                    $rec['breakOut'] = $breakOut;
                    $rec['breakIn'] = $breakIn;
                    $rec['out'] = $checkOut;
                }
            }
        }

        // Save parsed records into the database
        $newRecordsCount = 0;
        foreach ($records as $name => $months) {
            foreach ($months as $month => $days) {
                foreach ($days as $date => $rec) {
                    $employee = $this->findExistingEmployee($name);
                    if (!$employee) {
                        $employee = \App\Models\Employee::create(['name' => $name, 'status' => 'JO']);
                    }
                    $status = $employee->status;
                    foreach ($rec['logs'] as $log) {
                        $record = DTRRecord::firstOrCreate([
                            'employee_id' => $employee->id,
                            'log_date' => $date,
                            'log_time' => $log['time24'],
                        ], [
                            'batch_id' => $batchId,
                            'employee_name' => $name,
                            'status' => $status
                        ]);

                        if ($record->wasRecentlyCreated) {
                            $newRecordsCount++;
                        }
                    }
                }
            }
        }

        // Count total records
        $total = 0;
        foreach ($records as $person) {
            foreach ($person as $month) {
                foreach ($month as $day) {
                    $total += count($day['logs']);
                }
            }
        }

        return [
            'records' => $records,
            'totalRecords' => $total,
            'newRecords' => $newRecordsCount,
        ];
    }


    public function deleteMonthRecords(Request $request)
    {
        $employee = $request->input('employee');
        $monthStr = $request->input('month'); // e.g., "March 2026"

        try {
            $date = Carbon::parse($monthStr);
            $month = $date->month;
            $year = $date->year;

            DTRRecord::where('employee_name', $employee)
                ->whereMonth('log_date', $month)
                ->whereYear('log_date', $year)
                ->delete();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function findExistingEmployee($name)
    {
        // 1. Exact match
        $exact = \App\Models\Employee::where('name', $name)->first();
        if ($exact)
            return $exact;

        // 2. Normalized match (remove dots and extra spaces)
        $normalized = strtoupper(preg_replace('/\./', '', $name));
        $normalized = trim(preg_replace('/\s+/', ' ', $normalized));

        $employees = \App\Models\Employee::all();
        foreach ($employees as $emp) {
            $empNormalized = strtoupper(preg_replace('/\./', '', $emp->name));
            $empNormalized = trim(preg_replace('/\s+/', ' ', $empNormalized));

            if ($normalized === $empNormalized) {
                return $emp;
            }
        }

        return null;
    }

    public function history()
    {
        $batches = DTRBatch::orderByDesc('uploaded_at')
            ->paginate(10);

        return response()->json($batches);
    }

    public function deleteBatch($id)
    {
        $batch = DTRBatch::findOrFail($id);
        $batch->delete(); // This will trigger cascade delete on dtr_records
        return response()->json(['success' => true]);
    }

    public function batchRaw($id)
    {
        $batch = DTRBatch::findOrFail($id);
        return response()->json(['raw_log' => $batch->raw_log]);
    }



    private function isHolidayOrSuspended($dateStr)
    {
        $holiday = Holiday::where('date', $dateStr)->first();
        if (!$holiday) return null;
        return $holiday;
    }

    private function isHolidayWeek($dateStr)
    {
        $date = Carbon::parse($dateStr);
        $friday = $date->copy()->startOfWeek(Carbon::MONDAY)->addDays(4);
        return Holiday::where('date', $friday->format('Y-m-d'))->exists();
    }

    private function getEffectiveScheduleType($dateStr, $storedScheduleType)
    {
        if ($storedScheduleType) {
            return $storedScheduleType;
        }

        if ($this->isHolidayWeek($dateStr)) {
            return '8HR_FLEXI';
        }

        return null;
    }

    // Viewer landing page
    public function view()
    {
        $search = request('search', '');
        $monthFilter = request('month');
        $yearFilter = request('year');
        $statusFilter = request('status', '');

        // Get available months/years
        $availableDates = DTRRecord::selectRaw('DISTINCT YEAR(log_date) as year, MONTH(log_date) as month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // Auto-select latest month/year if not provided (capped at current date to avoid future test data)
        if (!$monthFilter || !$yearFilter) {
            $latestAvailable = $availableDates->filter(function($d) {
                return Carbon::create($d->year, $d->month, 1)->isPast() || Carbon::create($d->year, $d->month, 1)->isCurrentMonth();
            })->sortByDesc(fn($d) => $d->year . str_pad($d->month, 2, '0', STR_PAD_LEFT))->first();

            if ($latestAvailable) {
                $monthFilter = $monthFilter ?: $latestAvailable->month;
                $yearFilter = $yearFilter ?: $latestAvailable->year;
            } else {
                // Fallback to current month if no past/current data exists
                $monthFilter = $monthFilter ?: date('n');
                $yearFilter = $yearFilter ?: date('Y');
            }
        }

        // Pre-load holidays for the selected month
        $holidaysInMonth = Holiday::whereYear('date', $yearFilter)
            ->whereMonth('date', $monthFilter)
            ->get()
            ->keyBy(fn($h) => Carbon::parse($h->date)->format('Y-m-d'));

        // Employees query (NOT paginated yet)
        $employeesQuery = DTRRecord::select('dtr_records.employee_name')
            ->leftJoin('employees', 'employees.name', '=', 'dtr_records.employee_name')
            ->when($search, fn($q) => $q->where('dtr_records.employee_name', 'like', "%{$search}%"))
            ->when($statusFilter, fn($q) => $q->where(function($q2) use ($statusFilter) {
                $q2->where('employees.status', $statusFilter)
                   ->orWhere(function($q3) use ($statusFilter) {
                       $q3->whereNull('employees.id')
                          ->where('dtr_records.status', $statusFilter);
                   });
            }))
            ->whereYear('dtr_records.log_date', $yearFilter)
            ->whereMonth('dtr_records.log_date', $monthFilter)
            ->groupBy('dtr_records.employee_name')
            ->orderBy('dtr_records.employee_name');

        $employees = $employeesQuery->paginate(15)->withQueryString();

        // Build records for paginated employees
        $records = collect($employees->items())
            ->mapWithKeys(function ($emp) use ($monthFilter, $yearFilter, $statusFilter, $holidaysInMonth) {
                $logs = DTRRecord::where('employee_name', $emp->employee_name)
                    ->when($statusFilter, fn($q) => $q->whereHas('employeeByName', fn($q2) => $q2->where('status', $statusFilter)))
                    ->whereYear('log_date', $yearFilter)
                    ->whereMonth('log_date', $monthFilter)
                    ->orderBy('log_date')
                    ->orderBy('log_time')
                    ->get()
                    ->groupBy(fn($record) => Carbon::parse($record->log_date)->format('Y-m'));

                $result = [];

                foreach ($logs as $monthKey => $daysGroup) {
                    $year = (int) substr($monthKey, 0, 4);
                    $month = (int) substr($monthKey, 5, 2);
                    $monthName = Carbon::create($year, $month, 1)->format('F Y');
                    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);

                    $structured = [];
                    for ($day = 1; $day <= $daysInMonth; $day++) {
                        $date = Carbon::create($year, $month, $day);
                        $dateStr = $date->format('Y-m-d');
                        $weekday = $date->format('D');

                        $dayLogs = $daysGroup->where('log_date', $dateStr)
                            ->map(fn($log) => ['id' => $log->id, 'time' => $log->log_time])
                            ->values()
                            ->toArray();

                        $holiday = $holidaysInMonth[$dateStr] ?? null;
                        $dayScheduleType = $daysGroup->where('log_date', $dateStr)->first()?->schedule_type;
                        $effectiveScheduleType = $this->getEffectiveScheduleType($dateStr, $dayScheduleType);

                        $structured[$dateStr] = [
                            'weekday' => $weekday,
                            'logs' => $dayLogs,
                            'schedule_type' => $effectiveScheduleType,
                            'travel_order' => $daysGroup->where('log_date', $dateStr)->whereNotNull('travel_order')->first()?->travel_order,
                            'late_minutes' => $daysGroup->where('log_date', $dateStr)->first()?->late_minutes,
                            'undertime_minutes' => $daysGroup->where('log_date', $dateStr)->first()?->undertime_minutes,
                            'holiday' => $holiday ? [
                                'name' => $holiday->name,
                                'type' => $holiday->type,
                                'suspension_start_time' => $holiday->suspension_start_time ? Carbon::parse($holiday->suspension_start_time)->format('g:i A') : null,
                            ] : null,
                        ];
                    }

                    $result[$monthName] = $structured;
                }

                return [$emp->employee_name => $result];
            })
            ->toArray();

        // Calculate stats for the selected month
        $stats = DTRRecord::whereYear('log_date', $yearFilter)
            ->whereMonth('log_date', $monthFilter)
            ->leftJoin('employees', 'employees.name', '=', 'dtr_records.employee_name')
            ->selectRaw('COALESCE(employees.status, dtr_records.status) as status, COUNT(DISTINCT dtr_records.employee_name) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('Viewer/DTRLanding', [
            'records' => $records,
            'employees' => $employees->toArray(),
            'stats' => [
                'permanent' => $stats['PERMANENT'] ?? 0,
                'jo' => $stats['JO'] ?? 0,
            ],
            'filters' => [
                'search' => $search,
                'month' => (int) $monthFilter,
                'year' => (int) $yearFilter,
                'status' => $statusFilter,
            ],
            'availableDates' => $availableDates,
        ]);
    }

    public function generateDocx($employee, $month)
    {
        $outputDocx = $this->createDocxFile($employee, $month);
        if (!$outputDocx) {
            return response()->json(['error' => 'Failed to generate document.'], 500);
        }
        return response()->download($outputDocx)->deleteFileAfterSend(true);
    }

    private function createDocxFile($employee, $month, $customOutputDir = null)
    {
        $parsedMonth = Carbon::parse($month);
        $monthName = $parsedMonth->format('F Y');
        $yearMonth = $parsedMonth->format('Y-m');

        // Check status for template selection
        $status = Employee::where('name', $employee)->value('status');

        $templateFile = ($status === 'PERMANENT') ? 'Perma.docx' : 'JO.docx';
        $templatePath = storage_path("app/templates/{$templateFile}");

        if (!file_exists($templatePath)) {
            return null;
        }

        $records = DTRRecord::where('employee_name', $employee)
            ->when($status, fn($q) => $q->whereHas('employeeByName', fn($q2) => $q2->where('status', $status)))
            ->whereMonth('log_date', $parsedMonth->month)
            ->whereYear('log_date', $parsedMonth->year)
            ->orderBy('log_date')
            ->orderBy('log_time')
            ->get()
            ->groupBy('log_date');

        $breakRecords = BreakRecord::where('employee_name', $employee)
            ->whereMonth('log_date', $parsedMonth->month)
            ->whereYear('log_date', $parsedMonth->year)
            ->get()
            ->keyBy(fn($br) => Carbon::parse($br->log_date)->format('Y-m-d'));

        $holidaysInMonth = Holiday::whereYear('date', $parsedMonth->year)
            ->whereMonth('date', $parsedMonth->month)
            ->get()
            ->keyBy(fn($h) => Carbon::parse($h->date)->format('Y-m-d'));

        $templateProcessor = new TemplateProcessor($templatePath);

        // Replace placeholders
        $templateProcessor->setValue('employee_name', strtoupper($employee));
        $templateProcessor->setValue('month_name', $monthName);

        $daysInMonth = $parsedMonth->daysInMonth;

        // Clone rows
        $templateProcessor->cloneRow('row1', $daysInMonth);
        $templateProcessor->cloneRow('row2', $daysInMonth);

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::create($parsedMonth->year, $parsedMonth->month, $day);
            $dateStr = $date->format('Y-m-d');
            $weekday = $date->format('D');
            $logs = $records[$dateStr] ?? collect();

            // Handle per-day schedule toggle and Travel Order
            $daySchedule = $logs->first()?->schedule_type;
            if (!$daySchedule && $this->isHolidayWeek($dateStr)) {
                $daySchedule = '8HR_FLEXI';
            }
            $travelOrder = $logs->whereNotNull('travel_order')->first()?->travel_order;

            $holiday = $holidaysInMonth[$dateStr] ?? null;

            $checkIn = $breakOut = $breakIn = $checkOut = '';
            $suspensionTime = null;

            if ($travelOrder) {
                $checkIn = "TO: " . $travelOrder;
            } elseif ($holiday) {
                $holidayLabel = strtoupper($holiday->type) . ': ' . strtoupper($holiday->name);
                if ($holiday->suspension_start_time) {
                    $suspensionTime = Carbon::parse($holiday->suspension_start_time);
                    $holidayLabel .= ' (FROM ' . $suspensionTime->format('g:i A') . ')';
                }
                $checkIn = "MERGE_ROW_1_{$day}_HOLIDAY_" . rawurlencode($holidayLabel);
            } else {
                foreach ($logs as $log) {
                    $timeObj = Carbon::parse($log->log_time);
                    $hour = (int) $timeObj->format('H');
                    $time12 = $timeObj->format('g:i');

                    if ($hour >= 5 && $hour <= 11) {
                        if (empty($checkIn))
                            $checkIn = $time12;
                    } elseif ($hour == 12) {
                        if (empty($breakOut)) {
                            $breakOut = $time12;
                        } else {
                            $breakIn = $time12;
                        }
                    } elseif ($hour >= 13 && $hour <= 21) {
                        $checkOut = $time12;
                    }
                }

                if (!$travelOrder) {
                    $manualBreak = $breakRecords[$dateStr] ?? null;
                    if ($manualBreak) {
                        if ($manualBreak->break_out_time) {
                            $breakOut = Carbon::parse($manualBreak->break_out_time)->format('g:i');
                        }
                        if ($manualBreak->break_in_time) {
                            $breakIn = Carbon::parse($manualBreak->break_in_time)->format('g:i');
                        }
                    }
                }
            }

            $lateMinutes = null;
            $undertimeMinutes = null;

            if (!$travelOrder && !$holiday && $checkIn && $checkOut) {
                $timeToMins = function ($t, $isPM = false) {
                    if (!$t)
                        return 0;
                    $parts = explode(':', $t);
                    $h = (int) $parts[0];
                    $m = (int) $parts[1];

                    if ($isPM && $h < 12)
                        $h += 12;
                    if (!$isPM && $h == 12)
                        $h = 0;

                    return ($h * 60) + $m;
                };

                // Work schedule depends on the day (1-4 is 10hr shift, others 8hr)
                $dayOfWeek = $date->dayOfWeek; // 0 (Sun) - 6 (Sat)

                if ($daySchedule === '10HR') {
                    $schedStartMins = 7 * 60;
                    $schedEndMins = 18 * 60;
                    $latestStart = 8 * 60; // 8:00 AM
                } elseif ($daySchedule === '8HR') {
                    $schedStartMins = 8 * 60;
                    $schedEndMins = 17 * 60;
                    $latestStart = 9 * 60; // 9:00 AM
                } elseif ($daySchedule === '8HR_FLEXI') {
                    $schedStartMins = 7 * 60;
                    $schedEndMins = 17 * 60;
                    $latestStart = 8 * 60; // 8:00 AM
                } else {
                    $is10Hr = ($dayOfWeek >= 1 && $dayOfWeek <= 4);
                    $schedStartMins = $is10Hr ? (7 * 60) : (8 * 60);
                    $schedEndMins = $is10Hr ? (18 * 60) : (17 * 60);
                    $latestStart = $is10Hr ? (8 * 60) : (9 * 60);
                }

                $shiftLength = $schedEndMins - $schedStartMins;

                $inMins = $checkIn ? $timeToMins($checkIn, false) : null; // check in is AM
                $outMins = $checkOut ? $timeToMins($checkOut, true) : null; // check out is PM

                if ($inMins !== null) {
                    // 1. Calculate Late (strictly based on latest allowed start)
                    $late = max(0, $inMins - $latestStart);
                    if ($late > 0)
                        $lateMinutes = $late;

                    // 2. Calculate Effective Start for Duration
                    $is10Hr = ($daySchedule === '10HR' || (!in_array($daySchedule, ['10HR', '8HR', '8HR_FLEXI']) && ($dayOfWeek >= 1 && $dayOfWeek <= 4)));
                    $earliestStart = $is10Hr ? 420 : 360; // 10H = 7AM, 8H = 6AM
                    $effectiveStartMins = max($earliestStart, $inMins);

                    // 3. Calculate Undertime (must fulfill total shift duration)
                    if ($outMins !== null) {
                        if ($daySchedule === '8HR_FLEXI') {
                            $requiredEndMins = $inMins + 540; // check-in + 9 hours (8 work + 1 lunch)
                        } else {
                            $requiredEndMins = $effectiveStartMins + $shiftLength;
                        }
                        $under = max(0, $requiredEndMins - $outMins);
                        if ($under > 0)
                            $lateMinutes = ($lateMinutes ?? 0) + $under;
                    }
                }
            }

            if (!$travelOrder && $holiday && $holiday->suspension_start_time && $checkIn && $checkOut) {
                $timeToMins = function ($t, $isPM = false) {
                    if (!$t)
                        return 0;
                    $parts = explode(':', $t);
                    $h = (int) $parts[0];
                    $m = (int) $parts[1];

                    if ($isPM && $h < 12)
                        $h += 12;
                    if (!$isPM && $h == 12)
                        $h = 0;

                    return ($h * 60) + $m;
                };

                $dayOfWeek = $date->dayOfWeek;
                $is10Hr = ($daySchedule === '10HR' || (!in_array($daySchedule, ['10HR', '8HR']) && ($dayOfWeek >= 1 && $dayOfWeek <= 4)));

                if ($daySchedule === '10HR') {
                    $schedStartMins = 7 * 60;
                    $latestStart = 8 * 60;
                } elseif ($daySchedule === '8HR') {
                    $schedStartMins = 8 * 60;
                    $latestStart = 9 * 60;
                } else {
                    $schedStartMins = $is10Hr ? (7 * 60) : (8 * 60);
                    $latestStart = $is10Hr ? (8 * 60) : (9 * 60);
                }

                $suspensionMins = $suspensionTime->hour * 60 + $suspensionTime->minute;
                $shiftLength = $suspensionMins - $schedStartMins;

                $inMins = $timeToMins($checkIn, false);
                $outMins = $timeToMins($checkOut, true);

                if ($inMins !== null) {
                    $late = max(0, $inMins - $latestStart);
                    if ($late > 0) $lateMinutes = $late;

                    $earliestStart = $is10Hr ? 420 : 360;
                    $effectiveStartMins = max($earliestStart, $inMins);

                    $cappedOutMins = min($outMins, $suspensionMins);
                    $requiredEndMins = $effectiveStartMins + $shiftLength;
                    $under = max(0, $requiredEndMins - $cappedOutMins);
                    if ($under > 0) $lateMinutes = ($lateMinutes ?? 0) + $under;
                }
            }

            $formatMins = function ($mins) {
                if (!$mins)
                    return '';
                $h = floor($mins / 60);
                $m = $mins % 60;
                if ($h > 0 && $m > 0)
                    return "{$h} hr {$m} min";
                if ($h > 0)
                    return "{$h} hr";
                return "{$m} min";
            };

            $lateStr = $formatMins($lateMinutes);
            $underStr = $formatMins($undertimeMinutes);

            // First table (Original)
            $templateProcessor->setValue("row1#{$day}", $day);
            $templateProcessor->setValue("d1#{$day}", $weekday);
            if ($travelOrder) {
                $templateProcessor->setValue("in1#{$day}", "MERGE_ROW_1_{$day}_TO_{$travelOrder}");
                $templateProcessor->setValue("bout1#{$day}", "");
                $templateProcessor->setValue("bin1#{$day}", "");
                $templateProcessor->setValue("out1#{$day}", "");
            } elseif ($holiday) {
                $holidayLabel = strtoupper($holiday->type) . ': ' . strtoupper($holiday->name);
                if ($holiday->suspension_start_time) {
                    $holidayLabel .= ' (FROM ' . Carbon::parse($holiday->suspension_start_time)->format('g:i A') . ')';
                }
                $templateProcessor->setValue("in1#{$day}", "MERGE_ROW_1_{$day}_HOLIDAY_" . rawurlencode($holidayLabel));
                $templateProcessor->setValue("bout1#{$day}", "");
                $templateProcessor->setValue("bin1#{$day}", "");
                $templateProcessor->setValue("out1#{$day}", "");
            } else {
                $templateProcessor->setValue("in1#{$day}", $checkIn);
                $templateProcessor->setValue("bout1#{$day}", $breakOut);
                $templateProcessor->setValue("bin1#{$day}", $breakIn);
                $templateProcessor->setValue("out1#{$day}", $checkOut);
            }
            $templateProcessor->setValue("late1#{$day}", $lateStr);
            $templateProcessor->setValue("under1#{$day}", $underStr);

            // Second table (Duplicate)
            $templateProcessor->setValue("row2#{$day}", $day);
            $templateProcessor->setValue("d2#{$day}", $weekday);
            if ($travelOrder) {
                $templateProcessor->setValue("in2#{$day}", "MERGE_ROW_2_{$day}_TO_{$travelOrder}");
                $templateProcessor->setValue("bout2#{$day}", "");
                $templateProcessor->setValue("bin2#{$day}", "");
                $templateProcessor->setValue("out2#{$day}", "");
            } elseif ($holiday) {
                $holidayLabel = strtoupper($holiday->type) . ': ' . strtoupper($holiday->name);
                if ($holiday->suspension_start_time) {
                    $holidayLabel .= ' (FROM ' . Carbon::parse($holiday->suspension_start_time)->format('g:i A') . ')';
                }
                $templateProcessor->setValue("in2#{$day}", "MERGE_ROW_2_{$day}_HOLIDAY_" . rawurlencode($holidayLabel));
                $templateProcessor->setValue("bout2#{$day}", "");
                $templateProcessor->setValue("bin2#{$day}", "");
                $templateProcessor->setValue("out2#{$day}", "");
            } else {
                $templateProcessor->setValue("in2#{$day}", $checkIn);
                $templateProcessor->setValue("bout2#{$day}", $breakOut);
                $templateProcessor->setValue("bin2#{$day}", $breakIn);
                $templateProcessor->setValue("out2#{$day}", $checkOut);
            }
            $templateProcessor->setValue("late2#{$day}", $lateStr);
            $templateProcessor->setValue("under2#{$day}", $underStr);
        }

        $safeName = str_replace([' ', '/', '\\'], '_', $employee);
        $fileName = "DTR_{$safeName}_{$month}.docx";
        $outputDir = $customOutputDir ?: storage_path("app/public");
        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0777, true);
        }
        $outputPath = $outputDir . DIRECTORY_SEPARATOR . $fileName;
        $templateProcessor->saveAs($outputPath);

        // Perform raw XML manipulation to merge cells for Travel Orders
        $this->applyWordCellMerge($outputPath);

        return $outputPath;
    }

    private function applyWordCellMerge($path)
    {
        $zip = new \ZipArchive();
        if ($zip->open($path) === TRUE) {
            $xml = $zip->getFromName('word/document.xml');

            $xml = preg_replace_callback('/<w:tc[^>]*>(?:(?!<\/w:tc>).)*MERGE_ROW_(\d+)_(\d+)_TO_([^<]+).*?<\/w:tc>(?:\s*<w:tc[^>]*>(?:(?!<\/w:tc>).)*<\/w:tc>){3}/s', function ($matches) {
                $toValue = $matches[3];
                return '<w:tc>
                    <w:tcPr>
                        <w:gridSpan w:val="4"/>
                        <w:vAlign w:val="center"/>
                    </w:tcPr>
                    <w:p>
                        <w:pPr>
                            <w:jc w:val="center"/>
                        </w:pPr>
                        <w:r>
                            <w:rPr>
                                <w:b/>
                                <w:sz w:val="18"/>
                                <w:szCs w:val="18"/>
                            </w:rPr>
                            <w:t>TO: ' . htmlspecialchars($toValue) . '</w:t>
                        </w:r>
                    </w:p>
                </w:tc>';
            }, $xml);

            $xml = preg_replace_callback('/<w:tc[^>]*>(?:(?!<\/w:tc>).)*MERGE_ROW_(\d+)_(\d+)_HOLIDAY_([^<]+).*?<\/w:tc>(?:\s*<w:tc[^>]*>(?:(?!<\/w:tc>).)*<\/w:tc>){3}/s', function ($matches) {
                $holidayLabel = rawurldecode($matches[3]);
                return '<w:tc>
                    <w:tcPr>
                        <w:gridSpan w:val="4"/>
                        <w:vAlign w:val="center"/>
                    </w:tcPr>
                    <w:p>
                        <w:pPr>
                            <w:jc w:val="center"/>
                        </w:pPr>
                        <w:r>
                            <w:rPr>
                                <w:b/>
                                <w:sz w:val="18"/>
                                <w:szCs w:val="18"/>
                            </w:rPr>
                            <w:t>' . htmlspecialchars($holidayLabel) . '</w:t>
                        </w:r>
                    </w:p>
                </w:tc>';
            }, $xml);

            $zip->addFromString('word/document.xml', $xml);
            $zip->close();
        }
    }



    public function updateDaySchedule()
    {
        $employee = request('employee');
        $date = request('date');
        $type = request('type'); // '10HR', '8HR', or null

        DTRRecord::where('employee_name', $employee)
            ->where('log_date', $date)
            ->update(['schedule_type' => $type]);

        return response()->json(['status' => 'success']);
    }

    public function updateTravelOrder()
    {
        $employeeName = request('employee');
        $date = request('date');
        $toValue = request('travel_order'); // string or null

        $employee = $this->findExistingEmployee($employeeName);
        
        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        if ($toValue) {
            // If setting a Travel Order, we delete all existing records for that day
            // and create one single record with the travel order.
            DTRRecord::where('employee_name', $employeeName)
                ->where('log_date', $date)
                ->delete();

            DTRRecord::create([
                'employee_id' => $employee->id,
                'employee_name' => $employeeName,
                'log_date' => $date,
                'log_time' => '00:00', // Dummy time for placeholder
                'travel_order' => $toValue,
                'status' => $employee->status
            ]);
        } else {
            // If clearing a Travel Order:
            // 1. If it's a dummy record (log_time 00:00), delete it.
            // 2. If it's a real record, just clear the travel_order column.
            $dummy = DTRRecord::where('employee_name', $employeeName)
                ->where('log_date', $date)
                ->where('log_time', '00:00')
                ->first();

            if ($dummy) {
                $dummy->delete();
            } else {
                DTRRecord::where('employee_name', $employeeName)
                    ->where('log_date', $date)
                    ->update(['travel_order' => null]);
            }
        }

        return response()->json(['success' => true]);
    }

    private function getSofficePath()
    {
        $paths = [
            'C:\Program Files\LibreOffice\program\soffice.exe',
            'C:\Program Files (x86)\LibreOffice\program\soffice.exe',
            'C:\Program Files\LibreOffice 7\program\soffice.exe',
            'C:\Program Files\LibreOffice 24\program\soffice.exe',
        ];

        foreach ($paths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        return null;
    }

    public function generatePdf($employee, $month)
    {
        $outputDocx = $this->createDocxFile($employee, $month);
        if (!$outputDocx) {
            return response()->json(['error' => 'Failed to generate document.'], 500);
        }

        $outputPdf = str_replace('.docx', '.pdf', $outputDocx);
        $soffice = $this->getSofficePath();

        if (!$soffice) {
            return response()->json(['error' => 'LibreOffice (soffice.exe) not found on server.'], 500);
        }

        $command = '"' . $soffice . '" --headless --convert-to pdf "' . $outputDocx . '" --outdir "' . dirname($outputPdf) . '"';
        exec($command);

        if (file_exists($outputDocx)) {
            unlink($outputDocx);
        }

        if (!file_exists($outputPdf)) {
            return response()->json(['error' => 'PDF conversion failed.'], 500);
        }

        return response()->download($outputPdf)->deleteFileAfterSend(true);
    }

    public function downloadBulkPdf($month, $year, $status)
    {
        set_time_limit(0); // Increase execution time for large batches
        ini_set('memory_limit', '1024M'); // Increase memory limit for PDF merging

        $employeesQuery = DTRRecord::select('dtr_records.employee_name')
            ->leftJoin('employees', 'employees.name', '=', 'dtr_records.employee_name')
            ->when($status, fn($q) => $q->where(function($q2) use ($status) {
                $q2->where('employees.status', $status)
                   ->orWhere(function($q3) use ($status) {
                       $q3->whereNull('employees.id')
                          ->where('dtr_records.status', $status);
                   });
            }))
            ->whereYear('dtr_records.log_date', $year)
            ->whereMonth('dtr_records.log_date', $month)
            ->groupBy('dtr_records.employee_name')
            ->orderBy('dtr_records.employee_name');

        $employees = $employeesQuery->pluck('employee_name');

        if ($employees->isEmpty()) {
            return response()->json(['error' => 'No records found for the selected criteria.'], 404);
        }

        // Create a temporary directory for the batch
        $batchId = uniqid('dtr_bulk_');
        $tempDir = storage_path("app/temp_{$batchId}");
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0777, true);
        }

        $docxFiles = [];
        $monthStr = "{$year}-" . str_pad($month, 2, '0', STR_PAD_LEFT);
        foreach ($employees as $employee) {
            try {
                $docxPath = $this->createDocxFile($employee, $monthStr, $tempDir);
                if ($docxPath) {
                    $docxFiles[] = $docxPath;
                }
            } catch (\Throwable $e) {
                logger("Bulk PDF: Failed to generate DOCX for {$employee}: " . $e->getMessage());
            }
        }

        if (empty($docxFiles)) {
            return response()->json(['error' => 'Failed to generate documents.'], 500);
        }

        // Convert all to PDF
        $soffice = $this->getSofficePath();
        if (!$soffice) {
            return response()->json(['error' => 'LibreOffice not found.'], 500);
        }

        // Convert all DOCX in the temp directory to PDF in a single batch call (MUCH FASTER)
        $filesToConvert = glob($tempDir . DIRECTORY_SEPARATOR . "*.docx");
        if (!empty($filesToConvert)) {
            $escapedFiles = array_map(fn($f) => '"' . $f . '"', $filesToConvert);
            $command = '"' . $soffice . '" --headless --convert-to pdf ' . implode(' ', $escapedFiles) . ' --outdir "' . $tempDir . '"';
            exec($command);

            // Clean up DOCX files
            foreach ($filesToConvert as $docx) {
                if (file_exists($docx))
                    unlink($docx);
            }
        }

        // Check if PDFs were actually generated
        $generatedPdfs = glob($tempDir . DIRECTORY_SEPARATOR . "*.pdf");
        if (empty($generatedPdfs)) {
            File::deleteDirectory($tempDir);
            return response()->json(['error' => 'PDF conversion failed. No PDF files were created.'], 500);
        }

        // Merge all PDFs into a single PDF
        $finalPdfName = "DTR_SUMMARY_{$status}_{$monthStr}.pdf";
        $finalPdfPath = storage_path("app/{$finalPdfName}"); // Not in public

        try {
            $mpdf = new \Mpdf\Mpdf();
            $pdfFiles = glob($tempDir . DIRECTORY_SEPARATOR . "*.pdf");

            // Sort files alphabetically by employee name (extracted from filename)
            sort($pdfFiles);

            foreach ($pdfFiles as $index => $pdf) {
                $pageCount = $mpdf->setSourceFile($pdf);
                for ($i = 1; $i <= $pageCount; $i++) {
                    $tplId = $mpdf->importPage($i);
                    $mpdf->AddPage();
                    $mpdf->UseTemplate($tplId);
                }
            }
            $mpdf->Output($finalPdfPath, 'F');
        } catch (\Throwable $e) {
            // Fallback to ZIP if merging fails
            logger('Bulk PDF Merge Failed: ' . $e->getMessage());
            $zipName = "DTR_BULK_{$status}_{$monthStr}.zip";
            $zipPath = storage_path("app/{$zipName}");
            $zip = new \ZipArchive();
            if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === TRUE) {
                foreach (glob($tempDir . DIRECTORY_SEPARATOR . "*.pdf") as $pdf) {
                    $zip->addFile($pdf, basename($pdf));
                }
                $zip->close();
                File::deleteDirectory($tempDir);

                // Return ZIP but maybe inform the user? 
                // Since this is a direct download, we just return the ZIP.
                // The filename will have .zip so the frontend needs to handle it.
                return response()->download($zipPath)->deleteFileAfterSend(true);
            }
            return response()->json(['error' => 'Failed to generate PDF: ' . $e->getMessage()], 500);
        }

        // Clean up temp dir
        File::deleteDirectory($tempDir);

        return response()->download($finalPdfPath)->deleteFileAfterSend(true);
    }

      public function fetchEmployeeDTR($employee, $month, $year, $status = null)
      {
          $query = DTRRecord::where('employee_name', $employee)
              ->whereYear('log_date', $year)
              ->whereMonth('log_date', $month)
              ->orderBy('log_date')
              ->orderBy('log_time');

          if ($status) {
              $query->whereHas('employeeByName', fn($q2) => $q2->where('status', $status));
          }

          $logs = $query->get()
              ->groupBy(fn($record) => Carbon::parse($record->log_date)->format('Y-m'));

          // Pre-load holidays for the month
          $holidaysInMonth = Holiday::whereYear('date', $year)
              ->whereMonth('date', $month)
              ->get()
              ->keyBy(fn($h) => Carbon::parse($h->date)->format('Y-m-d'));

          $result = [];

          foreach ($logs as $monthKey => $daysGroup) {
              $yearNum = (int) substr($monthKey, 0, 4);
              $monthNum = (int) substr($monthKey, 5, 2);
              $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $monthNum, $yearNum);

              $structured = [];
              for ($day = 1; $day <= $daysInMonth; $day++) {
                  $dateStr = Carbon::create($yearNum, $monthNum, $day)->format('Y-m-d');
                  $weekday = Carbon::create($yearNum, $monthNum, $day)->format('D');

                  $dayLogs = $daysGroup->where('log_date', $dateStr)
                      ->map(fn($log) => ['id' => $log->id, 'time' => $log->log_time])
                      ->values()
                      ->toArray();

                   $holiday = $holidaysInMonth[$dateStr] ?? null;
                   $dayScheduleType = $daysGroup->where('log_date', $dateStr)->first()?->schedule_type;
                   $effectiveScheduleType = $this->getEffectiveScheduleType($dateStr, $dayScheduleType);

                     $structured[$dateStr] = [
                         'weekday' => $weekday,
                         'logs' => $dayLogs,
                         'schedule_type' => $effectiveScheduleType,
                         'travel_order' => $daysGroup->where('log_date', $dateStr)->whereNotNull('travel_order')->first()?->travel_order,
                         'late_minutes' => $daysGroup->where('log_date', $dateStr)->first()?->late_minutes,
                         'undertime_minutes' => $daysGroup->where('log_date', $dateStr)->first()?->undertime_minutes,
                         'holiday' => $holiday ? [
                             'name' => $holiday->name,
                             'type' => $holiday->type,
                             'suspension_start_time' => $holiday->suspension_start_time ? Carbon::parse($holiday->suspension_start_time)->format('g:i A') : null,
                         ] : null,
                     ];
              }

              $monthName = Carbon::create($yearNum, $monthNum, 1)->format('F Y');
              $result[$monthName] = $structured;
          }

          $breaks = \App\Models\BreakRecord::where('employee_name', $employee)
              ->whereYear('log_date', $year)
              ->whereMonth('log_date', $month)
              ->get()
              ->map(fn($br) => [
                  'id' => $br->id,
                  'log_date' => Carbon::parse($br->log_date)->format('Y-m-d'),
                  'break_out_time' => $br->break_out_time,
                  'break_in_time' => $br->break_in_time,
              ])
              ->values()
              ->toArray();

          return response()->json(['records' => $result, 'breaks' => $breaks]);
      }

      public function updateLogTime(Request $request)
     {
         $id = $request->input('id');
         $newTime = $request->input('time');

         $record = DTRRecord::findOrFail($id);
         $record->update(['log_time' => $newTime]);

         $this->calculateAndSaveDailyLateUndertime($record->employee_name, $record->log_date);

         return response()->json(['status' => 'success']);
     }

       private function calculateAndSaveDailyLateUndertime($employeeName, $logDate)
       {
           $holiday = $this->isHolidayOrSuspended($logDate);
           if ($holiday) {
               if ($holiday->suspension_start_time) {
                   $suspensionTime = Carbon::parse($holiday->suspension_start_time);
                   $logs = DTRRecord::where('employee_name', $employeeName)
                       ->whereDate('log_date', $logDate)
                       ->orderBy('log_time')
                       ->get();

                   $checkIn = null;
                   $checkOut = null;

                   foreach ($logs as $log) {
                       $timeObj = Carbon::parse($log->log_time);
                       $hour = (int) $timeObj->format('H');
                       $time12 = $timeObj->format('g:i');

                       if ($hour >= 5 && $hour <= 11 && empty($checkIn)) {
                           $checkIn = $time12;
                       } elseif ($hour >= 13 && $hour <= 21) {
                           $checkOut = $time12;
                       }
                   }

                   $lateMinutes = null;
                   $undertimeMinutes = null;

                    if ($checkIn && $checkOut) {
                        $inMins = $this->timeToMins($checkIn, false);
                        $outMins = $this->timeToMins($checkOut, true);
                        $suspensionMins = $suspensionTime->hour * 60 + $suspensionTime->minute;

                        $dayOfWeek = Carbon::parse($logDate)->dayOfWeek;
                        $is10Hr = ($dayOfWeek >= 1 && $dayOfWeek <= 4);
                        $schedStartMins = $is10Hr ? 420 : 480;
                        $latestStart = $is10Hr ? 480 : 540;

                        $late = max(0, $inMins - $latestStart);
                        if ($late > 0) $lateMinutes = $late;

                        $earliestStart = $is10Hr ? 420 : 360;
                        $effectiveStartMins = max($earliestStart, $inMins);

                        $shiftLength = $suspensionMins - $schedStartMins;
                        $cappedOutMins = min($outMins, $suspensionMins);
                        $requiredEndMins = $effectiveStartMins + $shiftLength;
                        $under = max(0, $requiredEndMins - $cappedOutMins);
                        if ($under > 0) $lateMinutes = ($lateMinutes ?? 0) + $under;
                    }

                   DTRRecord::where('employee_name', $employeeName)
                       ->whereDate('log_date', $logDate)
                       ->update([
                           'late_minutes' => $lateMinutes,
                           'undertime_minutes' => $undertimeMinutes,
                       ]);
                   return;
               }

               DTRRecord::where('employee_name', $employeeName)
                   ->whereDate('log_date', $logDate)
                   ->update([
                       'late_minutes' => null,
                       'undertime_minutes' => null,
                   ]);
               return;
           }

            $logs = DTRRecord::where('employee_name', $employeeName)
                ->whereDate('log_date', $logDate)
                ->orderBy('log_time')
                ->get();

            $checkIn = null;
            $checkOut = null;

            foreach ($logs as $log) {
                $timeObj = Carbon::parse($log->log_time);
                $hour = (int) $timeObj->format('H');
                $time12 = $timeObj->format('g:i');

                if ($hour >= 5 && $hour <= 11 && empty($checkIn)) {
                    $checkIn = $time12;
                } elseif ($hour >= 13 && $hour <= 21) {
                    $checkOut = $time12;
                }
            }

            $lateMinutes = null;
            $undertimeMinutes = null;

            if ($checkIn && $checkOut) {
                $timeToMins = function ($t, $isPM = false) {
                    if (!$t) return 0;
                    $parts = explode(':', $t);
                    $h = (int) $parts[0];
                    $m = (int) $parts[1];
                    if ($isPM && $h < 12) $h += 12;
                    if (!$isPM && $h == 12) $h = 0;
                    return ($h * 60) + $m;
                };

                $dayOfWeek = Carbon::parse($logDate)->dayOfWeek;
                $daySchedule = $logs->first()?->schedule_type;
                if (!$daySchedule && $this->isHolidayWeek($logDate)) {
                    $daySchedule = '8HR_FLEXI';
                }

                if ($daySchedule === '10HR') {
                    $schedStartMins = 7 * 60;
                    $schedEndMins = 18 * 60;
                    $latestStart = 8 * 60;
                } elseif ($daySchedule === '8HR') {
                    $schedStartMins = 8 * 60;
                    $schedEndMins = 17 * 60;
                    $latestStart = 9 * 60;
                } elseif ($daySchedule === '8HR_FLEXI') {
                    $schedStartMins = 7 * 60;
                    $schedEndMins = 17 * 60;
                    $latestStart = 8 * 60;
                } else {
                    $is10Hr = ($dayOfWeek >= 1 && $dayOfWeek <= 4);
                    $schedStartMins = $is10Hr ? (7 * 60) : (8 * 60);
                    $schedEndMins = $is10Hr ? (18 * 60) : (17 * 60);
                    $latestStart = $is10Hr ? (8 * 60) : (9 * 60);
                }

                $shiftLength = $schedEndMins - $schedStartMins;
                $inMins = $timeToMins($checkIn, false);
                $outMins = $timeToMins($checkOut, true);

                $late = max(0, $inMins - $latestStart);
                if ($late > 0) $lateMinutes = $late;

                $is10Hr = ($daySchedule === '10HR' || ($daySchedule === '8HR_FLEXI') || (!in_array($daySchedule, ['10HR', '8HR', '8HR_FLEXI']) && $dayOfWeek >= 1 && $dayOfWeek <= 4));
                $earliestStart = $is10Hr ? 420 : 360;
                $effectiveStartMins = max($earliestStart, $inMins);

                if ($outMins !== null) {
                    if ($daySchedule === '8HR_FLEXI') {
                        $requiredEndMins = $inMins + 540; // 9 hours from check-in (8 work + 1 lunch)
                    } else {
                        $requiredEndMins = $effectiveStartMins + $shiftLength;
                    }
                    $under = max(0, $requiredEndMins - $outMins);
                    if ($under > 0) $lateMinutes = ($lateMinutes ?? 0) + $under;
                }
            }

           DTRRecord::where('employee_name', $employeeName)
               ->whereDate('log_date', $logDate)
               ->update([
                   'late_minutes' => $lateMinutes,
                   'undertime_minutes' => $undertimeMinutes,
               ]);
       }

       private function timeToMins($time12, $isPM = false)
       {
           if (!$time12) return 0;
           $parts = explode(':', $time12);
           $h = (int) $parts[0];
           $m = (int) $parts[1];
           if ($isPM && $h < 12) $h += 12;
           if (!$isPM && $h == 12) $h = 0;
           return ($h * 60) + $m;
       }

       public function storeLogTime(Request $request)
       {
           $validated = $request->validate([
               'employee_name' => 'required|string|max:255',
               'log_date' => 'required|date',
               'log_time' => 'required|date_format:H:i',
           ]);

            $status = Employee::where('name', $validated['employee_name'])->value('status') ?: 'REGULAR';

           $record = DTRRecord::create([
               'employee_name' => $validated['employee_name'],
               'log_date' => $validated['log_date'],
               'log_time' => $validated['log_time'],
               'log_type' => 'out',
               'status' => $status ?: 'REGULAR',
           ]);

           $this->calculateAndSaveDailyLateUndertime($validated['employee_name'], $validated['log_date']);

           return response()->json(['status' => 'success', 'log' => $record]);
       }

       public function destroyLogTime(DTRRecord $log)
       {
           $employeeName = $log->employee_name;
           $logDate = $log->log_date;

           $log->delete();

           $this->calculateAndSaveDailyLateUndertime($employeeName, $logDate);

           return response()->json(['status' => 'success']);
       }
   }
