<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Holiday extends Model
{
    use HasFactory;

    protected $table = 'holidays';

    protected $fillable = [
        'date',
        'name',
        'type',
        'suspension_start_time',
    ];

    protected $casts = [
        'date' => 'date',
        'suspension_start_time' => 'datetime:H:i',
    ];
}
