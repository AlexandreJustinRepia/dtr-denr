<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DTRRecord extends Model
{
    use HasFactory;

    protected $table = 'dtr_records';

    protected $fillable = [
        'employee_name',
        'log_date',
        'log_time',
        'log_type',
    ];
}
