<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->integer('driver_number')->unique();
            $table->string('broadcast_name');
            $table->string('country_code');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('full_name');
            $table->string('name_acronym');
            $table->string('headshot_url');
            $table->string('team_colour');
            $table->string('team_name');
            $table->integer('meeting_key');
            $table->integer('session_key');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('openf1_drivers');
    }
};
