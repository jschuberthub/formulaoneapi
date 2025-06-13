<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\TeamRadioController;
use App\Http\Controllers\Api\WeatherController;

Route::apiResource('drivers', DriverController::class);
Route::apiResource('meetings', MeetingController::class);
Route::apiResource('sessions', SessionController::class);
Route::apiResource('team-radio', TeamRadioController::class);
Route::apiResource('weather', WeatherController::class);
