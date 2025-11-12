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

        // 🔸 Parse raw text line-by-line
        $lines = preg_split('/\r?\n/', trim($logText));
        $records = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') continue;

            // Example: "VIVIANNE VISPERAS CUNAN 10/01/2025 12:26:22 PM"
            if (!preg_match('/^(.*?)\s+(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}(?::\d{2})?\s*(AM|PM)?)/i', $line, $mLine)) {
                continue;
            }

            $name = trim($mLine[1]);
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

            // Convert to 24-hour format
            if ($ampm === 'PM' && $hour < 12) $hour += 12;
            if ($ampm === 'AM' && $hour == 12) $hour = 0;

            $displayTime = sprintf('%d:%02d', ($hour % 12 == 0 ? 12 : $hour % 12), $min);
            $time24 = sprintf('%02d:%02d', $hour, $min);
            $dateKey = sprintf('%04d-%02d-%02d', $year, $month, $day);
            $monthKey = sprintf('%04d-%02d', $year, $month);

            $records[$name][$monthKey][$dateKey]['logs'][] = [
                'time24' => $time24,
                'display' => $displayTime,
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
                        // Avoid duplicates if re-uploaded
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
        // Get all logs grouped by employee/month/day
        $records = DTRRecord::orderBy('employee_name')
            ->orderBy('log_date')
            ->orderBy('log_time')
            ->get()
            ->groupBy('employee_name')
            ->map(function ($employeeGroup) {
                return $employeeGroup->groupBy(function ($record) {
                    return Carbon::parse($record->log_date)->format('Y-m');
                })->map(function ($monthGroup, $monthKey) {
                    $year = (int) substr($monthKey, 0, 4);
                    $month = (int) substr($monthKey, 5, 2);

                    // Build all days of the month
                    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
                    $structured = [];

                    for ($day = 1; $day <= $daysInMonth; $day++) {
                        $date = Carbon::create($year, $month, $day);
                        $dateStr = $date->format('Y-m-d');
                        $weekday = $date->format('D'); // Mon, Tue, Wed, etc.

                        // Get logs for that date if they exist
                        $logs = $monthGroup->where('log_date', $dateStr)->map(function ($log) {
                            return [
                                'time' => $log->log_time,
                            ];
                        })->values();

                        $structured[$dateStr] = [
                            'weekday' => $weekday,
                            'logs' => $logs,
                        ];
                    }

                    return $structured;
                });
            });

        return Inertia::render('Viewer/DTRLanding', [
            'records' => $records,
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
