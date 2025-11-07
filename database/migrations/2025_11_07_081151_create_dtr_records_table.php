<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dtr_records', function (Blueprint $table) {
            $table->id();
            $table->string('employee_name');
            $table->date('log_date');
            $table->time('log_time');
            $table->string('log_type')->nullable(); // Optional, if you later want to tag IN/OUT
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dtr_records');
    }
};
