<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Meeting;
use Illuminate\Support\Facades\Http;

class ImportMeetings extends Command
{
    protected $signature = 'import:meetings';
    protected $description = 'Import meetings from OpenF1 API';

    public function handle()
    {
        $response = Http::get('https://api.openf1.org/v1/meetings');
        $meetings = $response->json();

        foreach ($meetings as $meeting) {
            dump($meeting);
            Meeting::updateOrCreate(
                ['meeting_key' => $meeting['meeting_key']],
                [
                    'meeting_name' => $meeting['meeting_name'],
                    'meeting_official_name' => $meeting['meeting_official_name'] ?? '',
                    'circuit_short_name' => $meeting['circuit_short_name'] ?? '',
                    'country_code' => $meeting['country_code'],
                    'country_name' => $meeting['country_name'],
                    'location' => $meeting['location'] ?? '',
                    'circuit_key' => $meeting['circuit_key'],
                    'country_key' => $meeting['country_key'],
                    'date_start' => $meeting['date_start'],
                    'gmt_offset' => $meeting['gmt_offset'] ?? '',
                    'year' => $meeting['year'],
                ]
            );
        }

        $this->info('Meetings imported successfully.');
    }
}
