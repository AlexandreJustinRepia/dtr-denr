<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('dtr_batches', function (Blueprint $table) {
            $table->id();
            $table->text('raw_log');           // the exact textarea content
            $table->string('hash', 64)->unique(); // SHA-256 of raw_log
            $table->unsignedInteger('record_count');
            $table->timestamp('uploaded_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dtr_batches');
    }
};