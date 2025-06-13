<?php

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

            dump($driver);

            if (!isset($driver['driver_number']) || empty($driver['driver_number'])) {
                continue;
            }

            Driver::updateOrCreate(
                ['driver_number' => $driver['driver_number']],
                [
                    'driver_number' => $driver['driver_number'],  // <--- Wichtig!
                    'broadcast_name' => $driver['broadcast_name'] ?? '',
                    'country_code' => $driver['country_code'] ?? '',
                    'first_name' => $driver['first_name'] ?? '',
                    'last_name' => $driver['last_name'] ?? '',
                    'full_name' => $driver['full_name'] ?? '',
                    'name_acronym' => $driver['name_acronym'] ?? '',
                    'headshot_url' => $driver['headshot_url'] ?? '',
                    'team_colour' => $driver['team_colour'] ?? '',
                    'team_name' => $driver['team_name'] ?? '',
                    'meeting_key' => $driver['meeting_key'] ?? 0,
                    'session_key' => $driver['session_key'] ?? 0,
                ]
            );
        }

        $this->info('Drivers imported successfully!');
    }

}
