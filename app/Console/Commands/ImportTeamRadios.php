<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\TeamRadio;

class ImportTeamRadios extends Command
{
    protected $signature = 'import:teamradios';
    protected $description = 'Import team radios from OpenF1 API';

    public function handle()
    {
        $response = Http::get('https://api.openf1.org/v1/team_radio');
        $teamRadios = $response->json();

        foreach ($teamRadios as $radio) {
            dump($radio);
            TeamRadio::updateOrCreate(
                [
                    'session_key' => $radio['session_key'],
                    'driver_number' => $radio['driver_number'],
                    'date' => $radio['date'],
                ],
                [
                    'meeting_key' => $radio['meeting_key'],
                    'recording_url' => $radio['recording_url'],
                ]
            );
        }

        $this->info('Team Radios imported successfully!');
    }
}
