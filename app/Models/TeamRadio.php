<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamRadio extends Model
{
    use HasFactory;

    protected $table = 'team_radios';

    protected $fillable = [
        'meeting_key',
        'session_key',
        'driver_number',
        'date',
        'recording_url',
    ];

    protected $casts = [
        'date' => 'datetime',
    ];
}
