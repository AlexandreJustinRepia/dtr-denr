<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DTRRecord extends Model
{
    use HasFactory;

    protected $table = 'dtr_records';

    protected $fillable = [
        'batch_id',
        'employee_id',
        'employee_name',
        'log_date',
        'log_time',
        'log_type',
        'status',
        'schedule_type'
    ];

    public function batch()
    {
        return $this->belongsTo(DTRBatch::class, 'batch_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
