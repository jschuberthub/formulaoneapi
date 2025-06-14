<?php

// Controller for CRUD operations on minimal Driver model
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
            'driver_number' => 'required|integer|unique:drivers',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'full_name' => 'required|string',
            'name_acronym' => 'required|string',
            'team_name' => 'required|string',
            'headshot_url' => 'nullable|string',
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
            'driver_number' => 'sometimes|required|integer|unique:drivers,driver_number,' . $id,
            'first_name' => 'sometimes|required|string',
            'last_name' => 'sometimes|required|string',
            'full_name' => 'sometimes|required|string',
            'name_acronym' => 'sometimes|required|string',
            'team_name' => 'sometimes|required|string',
            'headshot_url' => 'nullable|string',
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
