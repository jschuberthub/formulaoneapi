<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Weather extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_key',
        'session_key',
        'date',
        'air_temperature',
        'humidity',
        'pressure',
        'rainfall',
        'track_temperature',
        'wind_direction',
        'wind_speed',
    ];

    protected $casts = [
        'date' => 'datetime',
    ];
}
