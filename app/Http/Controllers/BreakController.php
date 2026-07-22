<?php

namespace App\Http\Controllers;

use App\Models\BreakRecord;
use App\Models\Employee;
use App\Models\DTRRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BreakController extends Controller
{
    public function index(Request $request)
    {
        $query = BreakRecord::query();

        if ($request->search) {
            $query->where('employee_name', 'like', "%{$request->search}%");
        }

        if ($request->from_date) {
            $query->whereDate('log_date', '>=', $request->from_date);
        }

        if ($request->to_date) {
            $query->whereDate('log_date', '<=', $request->to_date);
        }

        $breaks = $query->orderByDesc('log_date')->orderBy('employee_name')->paginate(10)->withQueryString();

        $checkoutQuery = DTRRecord::where('log_type', 'out');

        if ($request->search) {
            $checkoutQuery->where('employee_name', 'like', "%{$request->search}%");
        }

        if ($request->from_date) {
            $checkoutQuery->whereDate('log_date', '>=', $request->from_date);
        }

        if ($request->to_date) {
            $checkoutQuery->whereDate('log_date', '<=', $request->to_date);
        }

        $checkouts = $checkoutQuery->get()
            ->map(function ($record) {
                return [
                    'id' => $record->id,
                    'employee_name' => $record->employee_name,
                    'log_date' => Carbon::parse($record->log_date)->format('Y-m-d'),
                    'checkout_time' => Carbon::parse($record->log_time)->format('g:i'),
                ];
            })
            ->groupBy('employee_name')
            ->map(fn($items) => $items->keyBy('log_date'));

        return Inertia::render('Admin/BreakManagement', [
            'breaks' => $breaks,
            'filters' => $request->only(['search', 'from_date', 'to_date']),
            'employees' => Employee::orderBy('name')->get(['id', 'name']),
            'checkouts' => $checkouts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'nullable|exists:employees,id',
            'employee_name' => 'required|string|max:255',
            'log_date' => 'required|date',
            'break_out_time' => ['nullable', 'date_format:H:i', 'after_or_equal:12:00', 'before:12:59'],
            'break_in_time' => ['nullable', 'date_format:H:i', 'after:break_out_time', 'after_or_equal:12:00', 'before:12:59'],
        ]);

        $break = BreakRecord::create($request->only('employee_id', 'employee_name', 'log_date', 'break_out_time', 'break_in_time'));

        return response()->json(['message' => 'Break record created successfully.', 'break' => $break]);
    }

    public function update(Request $request, BreakRecord $break)
    {
        $request->validate([
            'employee_id' => 'nullable|exists:employees,id',
            'employee_name' => 'required|string|max:255',
            'log_date' => 'required|date',
            'break_out_time' => ['nullable', 'date_format:H:i', 'after_or_equal:12:00', 'before:12:59'],
            'break_in_time' => ['nullable', 'date_format:H:i', 'after:break_out_time', 'after_or_equal:12:00', 'before:12:59'],
        ]);

        $break->update($request->only('employee_id', 'employee_name', 'log_date', 'break_out_time', 'break_in_time'));

        return response()->json(['message' => 'Break record updated successfully.', 'break' => $break]);
    }

    public function destroy(BreakRecord $break)
    {
        $break->delete();

        return response()->json(['message' => 'Break record deleted successfully.']);
    }
}
