<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Weather;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Weather::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'weather_id' => 'required|integer|unique:weathers',
            'meeting_id' => 'required|integer|exists:meetings,meeting_id',
            'session_key' => 'nullable|string',
            'time' => 'nullable|string',
            'air_temperature' => 'nullable|numeric',
            'humidity' => 'nullable|numeric',
            'pressure' => 'nullable|numeric',
            'rainfall' => 'nullable|numeric',
            'track_temperature' => 'nullable|numeric',
            'wind_direction' => 'nullable|numeric',
            'wind_speed' => 'nullable|numeric',
        ]);

        $weather = Weather::create($data);

        return response()->json($weather, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Weather::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $weather = Weather::findOrFail($id);

        $data = $request->validate([
            'meeting_id' => 'nullable|integer|exists:meetings,meeting_id',
            'session_key' => 'nullable|string',
            'time' => 'nullable|string',
            'air_temperature' => 'nullable|numeric',
            'humidity' => 'nullable|numeric',
            'pressure' => 'nullable|numeric',
            'rainfall' => 'nullable|numeric',
            'track_temperature' => 'nullable|numeric',
            'wind_direction' => 'nullable|numeric',
            'wind_speed' => 'nullable|numeric',
        ]);

        $weather->update($data);

        return response()->json($weather);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $weather = Weather::findOrFail($id);
        $weather->delete();

        return response()->json(null, 204);
    }
}
