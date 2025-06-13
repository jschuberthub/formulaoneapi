<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Weather;

class ImportWeather extends Command
{
    protected $signature = 'import:weather';
    protected $description = 'Import weather data from OpenF1 API';

    public function handle()
    {
        $response = Http::get('https://api.openf1.org/v1/weather');
        $weatherData = $response->json();

        foreach ($weatherData as $weather) {
            dump($weather);
            Weather::updateOrCreate(
                [
                    'meeting_key' => $weather['meeting_key'],
                    'session_key' => $weather['session_key'],
                    'date' => $weather['date'],
                ],
                [
                    'air_temperature' => $weather['air_temperature'],
                    'humidity' => $weather['humidity'],
                    'pressure' => $weather['pressure'],
                    'rainfall' => $weather['rainfall'],
                    'track_temperature' => $weather['track_temperature'],
                    'wind_direction' => $weather['wind_direction'],
                    'wind_speed' => $weather['wind_speed'],
                ]
            );
        }

        $this->info('Weather data imported successfully!');
    }
}
