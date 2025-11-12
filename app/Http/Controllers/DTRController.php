<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use DateTime;
use App\Models\DTRRecord;
use Carbon\Carbon;
use PhpOffice\PhpWord\TemplateProcessor;

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
        if (!$logText) {
            return response()->json(['error' => 'No log provided'], 400);
        }

        // Extended list of Filipino first/last names (expand as needed)
        $nameDictionary = [
            // Corrected / Fixed Names
            'EMMANUEL','MACALINAO',
            'ARBIE','TALUCOD','ESTRELLA',
            'JOMAR','PIMENTEL',
            'KRIZ-TATUM OLAES LAPPAY', // keep as single name, no spacing
            'KATRINE','NAVAJA',
            'MARIA','KATRINA','MALLILLIN',
            'MARICRIS','PEREZ',
            'MARINEL','MACARANAS',
            'MARY','JANE','TENORIO',
            'MARY','JOY','MENGULLO',
            'MARK','JEFFERSON','CALUAG',
            'ROHN','JERICHO','DAYAP',
            'ROLANDO','RIVERA',
            'RONA','MAY','MARIN',
            'STEPHANIE','MAE','VALIENTE',
            'SHARA','MAE','BERMUDEZ',
            'RAMONA','ALLAUIGAN','DIANCIN',
            'ERA','BABBLE','CASTRO',
            'OFELIA','SARDENIA','CONAG',
            'REIZLE','GACUSAN',
            'RENZ','ESTRELLA',

            // Original Names
            'VIVIANNE','VISPERAS','CUNAN',
            'CYNTHIA','MANANGU','SAGUM',
            'KENNETH','RODRIGUEZ','ROL',
            'ARMANDO','GUIAO','SAWIT',
            'BHEBLIA','JOY','PASAGDAN',
            'JETHRO','TORRES','CERVANTES',
            'AURORA','CRISTOBAL','AQUINO',
            'JOSE','WILFREDO','LUCAS',
            'DANIEL','RABARA','DOMINGO',
            'DAN','SAYTONO',
            'JESSICA','GARCIA',
            'WINLOVE','BERNALES',
            'DENNIS','HERNANDEZ','LOPEZ',
            'CHRISTIAN','O.','SANTOS',
            'EDMAR','A.','GALLARDO',
            'MICHAEL','ESPOIR','JOVEN',
            'DONNA','BRIONES',
            'PERLITA','CAPARAS',
            'EDUARDO','MANLUNAS',
            'ALEXANDRE','JUSTIN','REPIA',
            'JAN','MICHAEL','CAMPUED'
        ];

        $exceptions = [
            'KRIZ-TATUM OLAES LAPPAY' => 'KRIZ-TATUM OLAES LAPPAY',
            'APRIL LYNN ESPAYOS NAVA' => 'APRIL LYNN ESPAYOS NAVA',
            'JOANAH MARIE PESCADOR O' => 'JOANAH MARIE PESCADOR O',
            'LIBRADO F GELLEZ JR' => 'LIBRADO F GELLEZ JR',
            'MELVIN ARIMAGAO MASIN' => 'MELVIN ARIMAGAO MASIN',
            'MARIANNE PASCUAL GONZAL' => 'MARIANNE PASCUAL GONZALES',
            'MARICRIS ACOSTA GONZALE' => 'MARICRIS ACOSTA GONZALES',
            'TERESA DELA CRUZ PARAIS' => 'TERESA DELA CRUZ PARAISO',
            'THELMA BATARA CASTRICIO' => 'THELMA BATARA CASTRICIONES',
            'MA LEONORAJIMENEZ VALIE' => 'MA LEONORA JIMENEZ VALIENTE',
            'ARGENTINA SEBASTIAN ABE' => 'ARGENTINA SEBASTIAN ABERIN'
        ];

        $formatName = function($rawName) use ($nameDictionary, $exceptions) {
            $rawName = preg_replace('/[^a-zA-Z\.\- ]/', '', $rawName);
            $rawName = strtoupper($rawName);

            // 🔹 Check for exceptions
            foreach ($exceptions as $wrong => $correct) {
                if (str_replace(' ', '', $rawName) === str_replace(' ', '', strtoupper($wrong))) {
                    return $correct; // return corrected name
                }
            }

            // 🔹 Otherwise, process normally with dictionary
            $formatted = [];
            $remaining = $rawName;

            usort($nameDictionary, fn($a,$b) => strlen($b) - strlen($a));

            while ($remaining) {
                $matched = false;

                foreach ($nameDictionary as $word) {
                    if (str_starts_with($remaining, $word)) {
                        $formatted[] = $word;
                        $remaining = substr($remaining, strlen($word));
                        $matched = true;
                        break;
                    }
                }

                if (!$matched) {
                    if (preg_match('/^([A-Z]\.?)(.*)$/', $remaining, $m)) {
                        $formatted[] = $m[1];
                        $remaining = $m[2] ?? '';
                    } else {
                        if (preg_match('/^([A-Z]{2,})(.*)$/', $remaining, $m)) {
                            $formatted[] = $m[1];
                            $remaining = $m[2] ?? '';
                        } else {
                            $formatted[] = $remaining[0];
                            $remaining = substr($remaining, 1);
                        }
                    }
                }
            }

            return implode(' ', $formatted); // ALL CAPS, spaced
        };

        // 🔸 Parse raw text line-by-line
        $lines = preg_split('/\r?\n/', trim($logText));
        $records = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') continue;

            // Example: "danielrabaradomingo 10/01/2025 12:26:22 PM"
            if (!preg_match('/^(.*?)\s+(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}(?::\d{2})?\s*(AM|PM)?)/i', $line, $mLine)) {
                continue;
            }

            $name = $formatName($mLine[1]); // Auto-format name properly
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

        // 🔸 Sort logs for each employee and date
        foreach ($records as &$person) {
            foreach ($person as &$monthGroup) {
                foreach ($monthGroup as &$rec) {
                    usort($rec['logs'], fn($a, $b) => $a['time24'] <=> $b['time24']);
                }
            }
        }

        // 🔹 Save parsed records into the database
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

        return response()->json([
            'records' => $records,
            'message' => 'DTR records have been successfully saved to the database.'
        ]);
    }



    // Viewer landing page
    public function view()
    {
        $search = request('search', '');
        $monthFilter = request('month', date('n'));
        $yearFilter = request('year', date('Y'));

        $employeesQuery = DTRRecord::select('employee_name')
            ->distinct()
            ->when($search, function($q) use ($search) {
                $q->where('employee_name', 'like', "%{$search}%");
            })
            ->orderBy('employee_name');

        $employees = \DB::table(\DB::raw("({$employeesQuery->toSql()}) as sub"))
            ->mergeBindings($employeesQuery->getQuery())
            ->paginate(15)
            ->withQueryString();

        // Build records from the current page items, converting every nested collection to arrays.
        $records = collect($employees->items())
            ->mapWithKeys(function ($emp) use ($monthFilter, $yearFilter) {
                $months = DTRRecord::where('employee_name', $emp->employee_name)
                    ->orderBy('log_date')
                    ->orderBy('log_time')
                    ->get()
                    ->groupBy(function ($record) {
                        return Carbon::parse($record->log_date)->format('Y-m');
                    });

                // Filter by month/year and build a pure-array structure
                $result = [];
                foreach ($months as $monthKey => $monthGroup) {
                    $year = (int) substr($monthKey, 0, 4);
                    $month = (int) substr($monthKey, 5, 2);
                    if ($year !== (int) $yearFilter || $month !== (int) $monthFilter) {
                        continue;
                    }

                    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
                    $structured = [];

                    for ($day = 1; $day <= $daysInMonth; $day++) {
                        $date = Carbon::create($year, $month, $day);
                        $dateStr = $date->format('Y-m-d');
                        $weekday = $date->format('D');

                        $logs = $monthGroup->where('log_date', $dateStr)->map(function ($log) {
                            return ['time' => $log->log_time];
                        })->values()->toArray();

                        $structured[$dateStr] = [
                            'weekday' => $weekday,
                            'logs' => $logs,
                        ];
                    }

                    $result[$monthKey] = $structured;
                }

                return [$emp->employee_name => $result];
            })
            ->toArray();

        return Inertia::render('Viewer/DTRLanding', [
            'records' => $records,
            'employees' => $employees->toArray(),       // paginator as plain array
            'filters' => [
                'search' => $search,
                'month' => (int) $monthFilter,
                'year' => (int) $yearFilter,
            ],
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
}
