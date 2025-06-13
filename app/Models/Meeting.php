<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_key',
        'meeting_name',
        'meeting_official_name',
        'circuit_short_name',
        'country_code',
        'country_name',
        'location',
        'circuit_key',
        'country_key',
        'date_start',
        'gmt_offset',
        'year',
    ];
}
