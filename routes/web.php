<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DTRController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::get('/', [DTRController::class, 'view'])->name('dtr.view');
Route::get('/generate-dtr/{employee}/{month}', [DTRController::class, 'generatePdf'])->name('dtr.generate');
Route::get('/fetch-dtr/{employee}/{month}/{year}', [DTRController::class, 'fetchEmployeeDTR'])
    ->name('dtr.fetch');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'CheckIfAdmin'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/admin/dtr', [DTRController::class, 'dtr'])->name('dtr');
    Route::post('/generate', [DTRController::class, 'generate'])->name('admin.dtr.generate');

    Route::get('/admin/dtr/history', [DTRController::class, 'history'])
        ->name('admin.dtr.history');
    Route::get('/admin/dtr/batch/{id}/raw', [DTRController::class, 'batchRaw'])
        ->name('admin.dtr.batch.raw');
});


require __DIR__.'/auth.php';
