<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('breaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employee_name');
            $table->date('log_date');
            $table->time('break_out_time')->nullable();
            $table->time('break_in_time')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'log_date']);
            $table->index(['log_date', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('breaks');
    }
};
