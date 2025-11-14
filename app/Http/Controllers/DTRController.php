<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use DateTime;
use App\Models\DTRRecord;
use Carbon\Carbon;
use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Settings;
use App\Models\DTRBatch;
use Illuminate\Support\Facades\Hash;

class DTRController extends Controller
{
    // Admin DTR page (React component)
    public function dtr()
    {
        return Inertia::render('Admin/DTRPage'); // React component in resources/js/Pages/Admin/DTRPage.jsx
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

        // ---- 2. Parse log text --------------------------------------------------
        $parsed = $this->parseLogText($logText);

        // ---- 3. Save batch (only if new) ----------------------------------------
        if (!$existing) {
            $batch = DTRBatch::create([
                'batch_name'   => $batchName,  // Save batch name
                'raw_log'      => $logText,
                'hash'         => $hash,
                'record_count' => $parsed['totalRecords'],
            ]);
            $batchId = $batch->id;
        } else {
            $batchId = $existing->id;
        }

        // ---- 4. Return ------------------------------------------------------------
        return response()->json([
            'records'      => $parsed['records'],
            'alreadySaved' => (bool) $existing,
            'batchId'      => $batchId,
            'message'      => $existing
                ? 'This log was already processed.'
                : 'DTR records have been successfully saved to the database.',
        ]);
    }

    /** Private method: parse log text */
    private function parseLogText(string $logText): array
    {
        $exceptions = [
            'EMMANUELMACALINAO' => 'EMMANUEL MACALINAO',
            'ARBIE TALUCOD ESTRELLA' => 'ARBIE TALUCOD ESTRELLA',
            'jomar pimentel' => 'JOMAR PIMENTEL',
            'katrine navaja' => 'KATRINE NAVAJA',
            'maria katrina mallillin' => 'MARIA KATRINA MALLILLIN',
            'MARICRISPEREZ' => 'MARICRIS PEREZ',
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
            'ERABABBLECASTRO' => 'ERA BABBLE CASTRO',
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
            'michael espoir joven' =>'MICHAEL ESPOIR JOVEN',
            'donna briones' => 'DONNA BRIONES',
            'perlita caparas' => 'PERLITA CAPARAS',
            'EDUARDO MANLUNAS' => 'EDUARDO MANLUNAS',
            'JAN MICHAEL CAMPUED' => 'JAN MICHAEL CAMPUED',
            'Alexandre Justin Repia' =>'ALEXANDRE JUSTIN REPIA',
            'KRIZ-TATUM OLAES LAPPAY' => 'KRIZ-TATUM OLAES LAPPAY',
            'APRIL LYNN ESPAYOS NAVA' => 'APRIL LYNN ESPAYOS NAVA',
            'JOANAH MARIE PESCADOR O' => 'JOANAH MARIE PESCADOR O',
            'LIBRADO F GELLEZ JR' => 'LIBRADO F GELLEZ JR',
            'MELVIN ARIMAGAO MASIN' => 'MELVIN ARIMAGAO MASIN',
            'MARIANNE PASCUAL GONZAL' => 'MARIANNE P. GONZALES',
            'MARICRIS ACOSTA GONZALE' => 'MARICRIS A. GONZALES',
            'TERESA DELA CRUZ PARAIS' => 'TERESA DELA CRUZ PARAISO',
            'THELMA BATARA CASTRICIO' => 'THELMA B. CASTRICIONES',
            'MA LEONORAJIMENEZ VALIE' => 'MA LEONORA JIMENEZ VALIENTE',
            'ARGENTINA SEBASTIAN ABE' => 'ARGENTINA S. ABERIN'
        ];

        $formatName = function($rawName) use ($exceptions) {
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
            if ($line === '') continue;

            if (!preg_match('/^(.*?)\s+(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}(?::\d{2})?\s*(AM|PM)?)/i', $line, $mLine)) {
                continue;
            }

            $name = $formatName($mLine[1]);
            $datetime = trim($mLine[2]);

            if (!preg_match('/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i', $datetime, $m)) {
                continue;
            }

            $month = (int)$m[1];
            $day = (int)$m[2];
            $year = (int)$m[3];
            $hour = (int)$m[4];
            $min = (int)$m[5];
            $ampm = isset($m[7]) ? strtoupper(trim($m[7])) : '';

            if ($ampm === 'PM' && $hour < 12) $hour += 12;
            if ($ampm === 'AM' && $hour == 12) $hour = 0;

            $time24 = sprintf('%02d:%02d', $hour, $min);
            $dateKey = sprintf('%04d-%02d-%02d', $year, $month, $day);
            $monthKey = sprintf('%04d-%02d', $year, $month);

            $records[$name][$monthKey][$dateKey]['logs'][] = [
                'time24' => $time24,
                'hour24' => $hour
            ];
        }

        // Sort logs for each employee and date
        foreach ($records as &$person) {
            foreach ($person as &$monthGroup) {
                foreach ($monthGroup as &$rec) {
                    usort($rec['logs'], fn($a, $b) => $a['time24'] <=> $b['time24']);
                }
            }
        }

        // Save parsed records into the database
        foreach ($records as $name => $months) {
            foreach ($months as $month => $days) {
                foreach ($days as $date => $rec) {
                    foreach ($rec['logs'] as $log) {
                        DTRRecord::firstOrCreate([
                            'employee_name' => $name,
                            'log_date' => $date,
                            'log_time' => $log['time24'],
                        ]);
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
            'records'      => $records,
            'totalRecords' => $total,
        ];
    }


    public function history()
    {
        $batches = DTRBatch::orderByDesc('uploaded_at')
            ->paginate(10);

        return response()->json($batches);
    }

    public function batchRaw($id)
    {
        $batch = DTRBatch::findOrFail($id);
        return response()->json(['raw_log' => $batch->raw_log]);
    }



    // Viewer landing page
    public function view()
    {
        $search = request('search', '');
        $monthFilter = request('month');
        $yearFilter = request('year');

        // Get available months and years globally
        $availableDates = DTRRecord::selectRaw('DISTINCT YEAR(log_date) as year, MONTH(log_date) as month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // Default to first available month/year if not provided
        $monthFilter = $monthFilter ?: ($availableDates->first()?->month ?? date('n'));
        $yearFilter = $yearFilter ?: ($availableDates->first()?->year ?? date('Y'));

        // Fetch distinct employee names with optional search
        $employeesQuery = DTRRecord::select('employee_name')
            ->distinct()
            ->when($search, fn($q) => $q->where('employee_name', 'like', "%{$search}%"))
            ->orderBy('employee_name');

        // Paginate employees
        $employees = \DB::table(\DB::raw("({$employeesQuery->toSql()}) as sub"))
            ->mergeBindings($employeesQuery->getQuery())
            ->paginate(15)
            ->withQueryString();

        // Build DTR records for all employees on the current page
        $records = collect($employees->items())
            ->mapWithKeys(function ($emp) use ($monthFilter, $yearFilter) {
                // Fetch all logs for this employee for the selected month/year
                $logs = DTRRecord::where('employee_name', $emp->employee_name)
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

                    $monthName = Carbon::create($year, $month, 1)->format('F Y'); // <-- New

                    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
                    $structured = [];

                    for ($day = 1; $day <= $daysInMonth; $day++) {
                        $date = Carbon::create($year, $month, $day);
                        $dateStr = $date->format('Y-m-d');
                        $weekday = $date->format('D');

                        $dayLogs = $daysGroup->where('log_date', $dateStr)
                            ->map(fn($log) => ['time' => $log->log_time])
                            ->values()
                            ->toArray();

                        $structured[$dateStr] = [
                            'weekday' => $weekday,
                            'logs' => $dayLogs,
                        ];
                    }

                    $result[$monthName] = $structured; // <-- Use human-readable month
                }

                return [$emp->employee_name => $result];
            })
            ->toArray();

        return Inertia::render('Viewer/DTRLanding', [
            'records' => $records,
            'employees' => $employees->toArray(),
            'filters' => [
                'search' => $search,
                'month' => (int) $monthFilter,
                'year' => (int) $yearFilter,
            ],
            'availableDates' => $availableDates,
        ]);
    }





    public function generateDocx($employee, $month)
    {
        $monthName = Carbon::parse($month . '-01')->format('F Y');

        $records = DTRRecord::where('employee_name', $employee)
            ->whereMonth('log_date', Carbon::parse($month)->month)
            ->whereYear('log_date', Carbon::parse($month)->year)
            ->orderBy('log_date')
            ->orderBy('log_time')
            ->get()
            ->groupBy('log_date');

        $templatePath = storage_path('app/templates/Sample.docx');
        $templateProcessor = new TemplateProcessor($templatePath);

        // Replace placeholders for employee name and month
        $templateProcessor->setValue('employee_name', strtoupper($employee));
        $templateProcessor->setValue('month_name', $monthName);

        $daysInMonth = Carbon::parse($month . '-01')->daysInMonth;

        // Clone rows for both tables
        $templateProcessor->cloneRow('n', $daysInMonth);   // first table
        $templateProcessor->cloneRow('2', $daysInMonth);  // second table

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::createFromFormat('Y-m-d', "{$month}-{$day}");
            $weekday = $date->format('D');
            $logs = $records[$date->format('Y-m-d')] ?? collect();

            $checkIn = $breakOut = $breakIn = $checkOut = '';

            foreach ($logs as $log) {
                $time24 = substr($log->log_time, 0, 5);
                $timeObj = Carbon::createFromFormat('H:i', $time24);
                $hour = (int)$timeObj->format('H');

                $time12 = $timeObj->format('g:i'); // 12-hour without AM/PM

                if ($hour >= 5 && $hour <= 11) {
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

            // Fill first table (formatted in template)
            $templateProcessor->setValue("n#{$day}", $day);
            $templateProcessor->setValue("d#{$day}", $weekday);
            $templateProcessor->setValue("c_in#{$day}", $checkIn);
            $templateProcessor->setValue("b_out#{$day}", $breakOut);
            $templateProcessor->setValue("b_in#{$day}", $breakIn);
            $templateProcessor->setValue("c_out#{$day}", $checkOut);

            // Fill second table
            $templateProcessor->setValue("2#{$day}", $day);       // if you clone row for second table separately, use "n2#{$day}" placeholder in template
            $templateProcessor->setValue("l#{$day}", $weekday);   // match exactly `${d}` in template
            $templateProcessor->setValue("c_in2#{$day}", $checkIn);
            $templateProcessor->setValue("b_ou2#{$day}", $breakOut);
            $templateProcessor->setValue("b_in2#{$day}", $breakIn);
            $templateProcessor->setValue("c_ou2#{$day}", $checkOut);
        }

        $outputPath = storage_path("app/public/DTR_{$employee}_{$month}.docx");
        $templateProcessor->saveAs($outputPath);

        return response()->download($outputPath)->deleteFileAfterSend(true);
    }

    public function generatePdf($employee, $month)
    {
        $monthName = Carbon::parse($month . '-01')->format('F Y');

        $records = DTRRecord::where('employee_name', $employee)
            ->whereMonth('log_date', Carbon::parse($month)->month)
            ->whereYear('log_date', Carbon::parse($month)->year)
            ->orderBy('log_date')
            ->orderBy('log_time')
            ->get()
            ->groupBy('log_date');

        $templatePath = storage_path('app/templates/Sample.docx');
        $templateProcessor = new TemplateProcessor($templatePath);

        // Replace placeholders for employee name and month
        $templateProcessor->setValue('employee_name', strtoupper($employee));
        $templateProcessor->setValue('month_name', $monthName);

        $daysInMonth = Carbon::parse($month . '-01')->daysInMonth;

        // Clone rows for both tables
        $templateProcessor->cloneRow('n', $daysInMonth);
        $templateProcessor->cloneRow('2', $daysInMonth);

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::createFromFormat('Y-m-d', "{$month}-{$day}");
            $weekday = $date->format('D');
            $logs = $records[$date->format('Y-m-d')] ?? collect();

            $checkIn = $breakOut = $breakIn = $checkOut = '';

            foreach ($logs as $log) {
                $time24 = substr($log->log_time, 0, 5);
                $timeObj = Carbon::createFromFormat('H:i', $time24);
                $hour = (int)$timeObj->format('H');
                $time12 = $timeObj->format('g:i');

                if ($hour >= 5 && $hour <= 11) {
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

            // Fill first table
            $templateProcessor->setValue("n#{$day}", $day);
            $templateProcessor->setValue("d#{$day}", $weekday);
            $templateProcessor->setValue("c_in#{$day}", $checkIn);
            $templateProcessor->setValue("b_out#{$day}", $breakOut);
            $templateProcessor->setValue("b_in#{$day}", $breakIn);
            $templateProcessor->setValue("c_out#{$day}", $checkOut);

            // Fill second table
            $templateProcessor->setValue("2#{$day}", $day);
            $templateProcessor->setValue("l#{$day}", $weekday);
            $templateProcessor->setValue("c_in2#{$day}", $checkIn);
            $templateProcessor->setValue("b_ou2#{$day}", $breakOut);
            $templateProcessor->setValue("b_in2#{$day}", $breakIn);
            $templateProcessor->setValue("c_ou2#{$day}", $checkOut);
        }

        // ✅ Save temporary DOCX file
        $outputDocx = storage_path("app/public/DTR_{$employee}_{$month}.docx");
        $templateProcessor->saveAs($outputDocx);

        // ✅ Convert DOCX → PDF using LibreOffice headless (Windows)
        $outputPdf = storage_path("app/public/DTR_{$employee}_{$month}.pdf");

        $command = '"C:\Program Files\LibreOffice\program\soffice.exe" --headless --convert-to pdf "' . $outputDocx . '" --outdir "' . dirname($outputPdf) . '"';
        exec($command);

        // ✅ Delete the DOCX after conversion (optional but cleaner)
        if (file_exists($outputDocx)) {
            unlink($outputDocx);
        }

        // ✅ Return the generated PDF
        return response()->download($outputPdf)->deleteFileAfterSend(true);
    }
}
