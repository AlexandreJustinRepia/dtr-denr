<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DTRController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BreakController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class , 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class , 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class , 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'CheckIfAdmin'])->group(function () {
    Route::get('/dashboard', [DTRController::class , 'dashboard'])->name('dashboard');
    Route::get('/admin/dtr', [DTRController::class , 'dtr'])->name('dtr');
    Route::post('/generate', [DTRController::class , 'generate'])->name('admin.dtr.generate');
    Route::get('/generate-dtr-docx/{employee}/{month}', [DTRController::class , 'generateDocx']);

    Route::get('/admin/dtr/history', [DTRController::class , 'history'])
        ->name('admin.dtr.history');
    Route::get('/admin/dtr/batch/{id}/raw', [DTRController::class , 'batchRaw'])
        ->name('admin.dtr.batch.raw');
    Route::delete('/admin/dtr/batch/{id}', [DTRController::class , 'deleteBatch'])
        ->name('admin.dtr.batch.delete');

    Route::get('/', [DTRController::class , 'view'])->name('dtr.view');
    Route::get('/generate-dtr/{employee}/{month}', [DTRController::class , 'generatePdf'])->name('dtr.generate');
    Route::get('/fetch-dtr/{employee}/{month}/{year}', [DTRController::class , 'fetchEmployeeDTR'])
        ->name('dtr.fetch');
    Route::post('/update-schedule', [DTRController::class , 'updateDaySchedule'])->name('dtr.update-schedule');
    Route::post('/update-log-time', [DTRController::class , 'updateLogTime'])->name('dtr.update-log-time');
    Route::post('/update-travel-order', [DTRController::class , 'updateTravelOrder'])->name('dtr.update-travel-order');
    Route::post('/delete-month-records', [DTRController::class, 'deleteMonthRecords'])->name('dtr.delete-month');
    Route::get('/generate-bulk-dtr/{month}/{year}/{status}', [DTRController::class , 'downloadBulkPdf'])->name('dtr.generate-bulk');

    // Employee Management
    Route::get('/admin/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::patch('/admin/employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::delete('/admin/employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
    Route::post('/admin/employees/merge', [EmployeeController::class, 'merge'])->name('employees.merge');

    // User Management
    Route::get('/admin/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/admin/users', [UserController::class, 'store'])->name('users.store');
    Route::patch('/admin/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Break Management
    Route::get('/admin/breaks', [BreakController::class, 'index'])->name('breaks.index');
    Route::post('/admin/breaks', [BreakController::class, 'store'])->name('breaks.store');
    Route::patch('/admin/breaks/{break}', [BreakController::class, 'update'])->name('breaks.update');
    Route::delete('/admin/breaks/{break}', [BreakController::class, 'destroy'])->name('breaks.destroy');
});


require __DIR__ . '/auth.php';
