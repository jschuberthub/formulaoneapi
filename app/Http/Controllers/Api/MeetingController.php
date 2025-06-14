<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Meeting::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'meeting_key' => 'required|integer|unique:meetings',
            'meeting_name' => 'required|string',
            'meeting_official_name' => 'nullable|string',
            'circuit_short_name' => 'nullable|string',
            'country_code' => 'required|string',
            'country_name' => 'required|string',
            'location' => 'nullable|string',
            'circuit_key' => 'required|integer',
            'country_key' => 'required|integer',
            'date_start' => 'required|date',
            'gmt_offset' => 'nullable|string',
            'year' => 'required|integer',
        ]);

        $meeting = Meeting::create($data);

        return response()->json($meeting, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Meeting::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $meeting = Meeting::findOrFail($id);

        $data = $request->validate([
            'meeting_key' => 'sometimes|integer|unique:meetings,meeting_key,' . $id,
            'meeting_name' => 'nullable|string',
            'meeting_official_name' => 'nullable|string',
            'circuit_short_name' => 'nullable|string',
            'country_code' => 'nullable|string',
            'country_name' => 'nullable|string',
            'location' => 'nullable|string',
            'circuit_key' => 'nullable|integer',
            'country_key' => 'nullable|integer',
            'date_start' => 'nullable|date',
            'gmt_offset' => 'nullable|string',
            'year' => 'nullable|integer',
        ]);

        $meeting->update($data);

        return response()->json($meeting);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $meeting = Meeting::findOrFail($id);
        $meeting->delete();

        return response()->json(null, 204);
    }
}
