<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BreakRecord extends Model
{
    protected $table = 'breaks';

    protected $fillable = [
        'employee_id',
        'employee_name',
        'log_date',
        'break_out_time',
        'break_in_time',
    ];

    protected $casts = [
        'log_date' => 'date',
        'break_out_time' => 'datetime:H:i',
        'break_in_time' => 'datetime:H:i',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
