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
            'meeting_id' => 'required|integer|unique:meetings',
            'year' => 'nullable|integer',
            'url' => 'nullable|url',
            'name' => 'nullable|string',
            'date' => 'nullable|date',
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
            'year' => 'nullable|integer',
            'url' => 'nullable|url',
            'name' => 'nullable|string',
            'date' => 'nullable|date',
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
