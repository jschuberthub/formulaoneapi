<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
        'driver_number',
        'first_name',
        'last_name',
        'full_name',
        'name_acronym',
        'team_name',
        'headshot_url',
    ];
}
