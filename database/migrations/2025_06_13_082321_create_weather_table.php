<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('weather', function (Blueprint $table) {
            $table->id();
            $table->integer('meeting_key');
            $table->integer('session_key');
            $table->timestamp('date');
            $table->float('air_temperature');
            $table->float('humidity');
            $table->float('pressure');
            $table->float('rainfall');
            $table->float('track_temperature');
            $table->integer('wind_direction');
            $table->float('wind_speed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weather');
    }
};
