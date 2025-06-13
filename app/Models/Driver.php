<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
        'driver_number',
        'broadcast_name',
        'country_code',
        'first_name',
        'last_name',
        'full_name',
        'name_acronym',
        'headshot_url',
        'team_colour',
        'team_name',
        'meeting_key',
        'session_key',
    ];
}
