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
            'meeting_id' => 'required|integer|exists:meetings,meeting_id',
            'session_key' => 'nullable|string',
            'name' => 'nullable|string',
            'date' => 'nullable|date',
            'time' => 'nullable|string',
            'type' => 'nullable|string',
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
            'meeting_id' => 'nullable|integer|exists:meetings,meeting_id',
            'session_key' => 'nullable|string',
            'name' => 'nullable|string',
            'date' => 'nullable|date',
            'time' => 'nullable|string',
            'type' => 'nullable|string',
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
