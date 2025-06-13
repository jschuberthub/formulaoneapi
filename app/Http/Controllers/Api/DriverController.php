<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Driver::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'driver_id' => 'required|integer|unique:drivers',
            'permanent_number' => 'nullable|string',
            'code' => 'nullable|string',
            'given_name' => 'nullable|string',
            'family_name' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'nationality' => 'nullable|string',
            'url' => 'nullable|url',
        ]);

        $driver = Driver::create($data);

        return response()->json($driver, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Driver::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $driver = Driver::findOrFail($id);

        $data = $request->validate([
            'permanent_number' => 'nullable|string',
            'code' => 'nullable|string',
            'given_name' => 'nullable|string',
            'family_name' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'nationality' => 'nullable|string',
            'url' => 'nullable|url',
        ]);

        $driver->update($data);

        return response()->json($driver);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $driver = Driver::findOrFail($id);
        $driver->delete();

        return response()->json(null, 204);
    }
}
