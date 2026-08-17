<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HolidayController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->query('year', date('Y'));
        $month = $request->query('month', date('m'));

        $holidays = Holiday::whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date')
            ->paginate(50);

        return Inertia::render('Admin/HolidayManagement', [
            'holidays' => $holidays,
            'filters' => $request->only(['year', 'month']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date|unique:holidays,date',
            'name' => 'required|string|max:255',
            'type' => 'required|in:holiday,suspended',
            'suspension_start_time' => 'nullable|date_format:H:i',
        ]);

        $holiday = Holiday::create($validated);

        return response()->json($holiday, 201);
    }

    public function show(Holiday $holiday)
    {
        return response()->json($holiday);
    }

    public function update(Request $request, Holiday $holiday)
    {
        $validated = $request->validate([
            'date' => 'required|date|unique:holidays,date,' . $holiday->id,
            'name' => 'required|string|max:255',
            'type' => 'required|in:holiday,suspended',
            'suspension_start_time' => 'nullable|date_format:H:i',
        ]);

        $holiday->update($validated);

        return response()->json($holiday);
    }

    public function destroy(Holiday $holiday)
    {
        $holiday->delete();

        return response()->json(['success' => true]);
    }
}
