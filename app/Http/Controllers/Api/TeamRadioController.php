<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamRadio;
use Illuminate\Http\Request;

class TeamRadioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return TeamRadio::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'team_radio_id' => 'required|integer|unique:team_radios',
            'meeting_id' => 'required|integer|exists:meetings,meeting_key',
            'session_key' => 'nullable|string',
            'lap_number' => 'nullable|integer',
            'driver_number' => 'nullable|integer',
            'channel' => 'nullable|string',
            'time' => 'nullable|string',
            'message' => 'nullable|string',
        ]);

        $teamRadio = TeamRadio::create($data);

        return response()->json($teamRadio, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return TeamRadio::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $teamRadio = TeamRadio::findOrFail($id);

        $data = $request->validate([
            'meeting_id' => 'nullable|integer|exists:meetings,meeting_key',
            'session_key' => 'nullable|string',
            'lap_number' => 'nullable|integer',
            'driver_number' => 'nullable|integer',
            'channel' => 'nullable|string',
            'time' => 'nullable|string',
            'message' => 'nullable|string',
        ]);

        $teamRadio->update($data);

        return response()->json($teamRadio);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $teamRadio = TeamRadio::findOrFail($id);
        $teamRadio->delete();

        return response()->json(null, 204);
    }
}
