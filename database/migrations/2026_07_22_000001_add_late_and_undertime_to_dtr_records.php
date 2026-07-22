<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dtr_records', function (Blueprint $table) {
            $table->unsignedInteger('late_minutes')->nullable()->after('log_type');
            $table->unsignedInteger('undertime_minutes')->nullable()->after('late_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('dtr_records', function (Blueprint $table) {
            $table->dropColumn(['late_minutes', 'undertime_minutes']);
        });
    }
};
