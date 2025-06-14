<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Session;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Session::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'session_id' => 'required|integer|unique:sessions',
            'meeting_id' => 'required|integer|exists:meetings,meeting_key',
            'meeting_key' => 'required|integer',
            'session_key' => 'required|integer',
            'session_name' => 'required|string',
            'session_type' => 'required|string',
            'circuit_key' => 'required|integer',
            'circuit_short_name' => 'required|string',
            'country_code' => 'required|string',
            'country_key' => 'required|integer',
            'country_name' => 'required|string',
            'location' => 'required|string',
            'date_start' => 'required|date',
            'date_end' => 'required|date',
            'gmt_offset' => 'nullable|string',
            'year' => 'required|integer',
        ]);

        $session = Session::create($data);

        return response()->json($session, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Session::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $session = Session::findOrFail($id);

        $data = $request->validate([
            'meeting_id' => 'sometimes|required|integer|exists:meetings,meeting_key',
            'meeting_key' => 'sometimes|required|integer',
            'session_key' => 'sometimes|required|integer',
            'session_name' => 'sometimes|required|string',
            'session_type' => 'sometimes|required|string',
            'circuit_key' => 'sometimes|required|integer',
            'circuit_short_name' => 'sometimes|required|string',
            'country_code' => 'sometimes|required|string',
            'country_key' => 'sometimes|required|integer',
            'country_name' => 'sometimes|required|string',
            'location' => 'sometimes|required|string',
            'date_start' => 'sometimes|required|date',
            'date_end' => 'sometimes|required|date',
            'gmt_offset' => 'nullable|string',
            'year' => 'sometimes|required|integer',
        ]);

        $session->update($data);

        return response()->json($session);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $session = Session::findOrFail($id);
        $session->delete();

        return response()->json(null, 204);
    }
}
