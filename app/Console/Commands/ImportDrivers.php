<?php

// Command to import drivers from OpenF1 API using minimal driver fields
namespace App\Console\Commands;

use App\Models\Driver;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ImportDrivers extends Command
{
    protected $signature = 'import:drivers';
    protected $description = 'Import drivers from OpenF1 API';

    public function handle()
    {
        $response = Http::get('https://api.openf1.org/v1/drivers');
        $drivers = $response->json();

        foreach ($drivers as $driver) {
            if (!isset($driver['driver_number']) || empty($driver['driver_number'])) {
                continue;
            }
            Driver::updateOrCreate(
                ['driver_number' => $driver['driver_number']],
                [
                    'driver_number' => $driver['driver_number'],
                    'first_name' => $driver['first_name'] ?? '',
                    'last_name' => $driver['last_name'] ?? '',
                    'full_name' => $driver['full_name'] ?? '',
                    'name_acronym' => $driver['name_acronym'] ?? '',
                    'team_name' => $driver['team_name'] ?? '',
                    'headshot_url' => $driver['headshot_url'] ?? '',
                ]
            );
        }

        $this->info('Drivers imported successfully!');
    }
}
