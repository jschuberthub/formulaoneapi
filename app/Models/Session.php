<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;

    protected $table = 'f1_sessions';

    protected $fillable = [
        'session_key',
        'session_name',
        'session_type',
        'meeting_key',
        'circuit_key',
        'circuit_short_name',
        'country_code',
        'country_key',
        'country_name',
        'location',
        'date_start',
        'date_end',
        'gmt_offset',
        'year',
    ];
}
