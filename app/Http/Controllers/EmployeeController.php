<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Inertia\Inertia;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::orderBy('name')->get()->map(function($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->name,
                'status' => $employee->status,
                'added_ago' => $employee->created_at->diffForHumans(),
            ];
        });

        return Inertia::render('Viewer/EmployeeManagement', [
            'employees' => $employees
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:employees,name,' . $employee->id,
            'status' => 'required|in:PERMANENT,JO',
        ]);

        $employee->update($request->only('name', 'status'));

        // Sync status to all their DTR records
        \App\Models\DTRRecord::where('employee_id', $employee->id)->update([
            'status' => $employee->status,
            'employee_name' => $employee->name // Also sync name in case it changed
        ]);

        return back()->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return back()->with('success', 'Employee deleted successfully.');
    }
}
