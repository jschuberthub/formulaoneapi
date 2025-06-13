<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Session;
use Illuminate\Support\Facades\Http;

class ImportSessions extends Command
{
    protected $table = 'f1_sessions';
    protected $signature = 'import:sessions';
    protected $description = 'Import sessions from OpenF1 API';

    public function handle()
    {
        $response = Http::get('https://api.openf1.org/v1/sessions');
        $sessions = $response->json();

        foreach ($sessions as $session) {
            dump($session);
            Session::updateOrCreate(
                ['session_key' => $session['session_key']],
                [
                    'session_name' => $session['session_name'],
                    'session_type' => $session['session_type'],
                    'meeting_key' => $session['meeting_key'],
                    'circuit_key' => $session['circuit_key'],
                    'circuit_short_name' => $session['circuit_short_name'],
                    'country_code' => $session['country_code'],
                    'country_key' => $session['country_key'],
                    'country_name' => $session['country_name'],
                    'location' => $session['location'],
                    'date_start' => $session['date_start'],
                    'date_end' => $session['date_end'],
                    'gmt_offset' => $session['gmt_offset'] ?? '',
                    'year' => $session['year'],
                ]
            );
        }

        $this->info('Sessions imported successfully.');
    }
}
