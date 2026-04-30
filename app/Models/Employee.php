<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = ['name', 'status'];

    public function dtrRecords()
    {
        return $this->hasMany(DTRRecord::class);
    }
}
