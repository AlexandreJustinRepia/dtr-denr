<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DTRBatch extends Model
{
    protected $table = 'dtr_batches';
    protected $fillable = [
        'raw_log', 
        'hash', 
        'record_count',
        'batch_name'
    ];
}