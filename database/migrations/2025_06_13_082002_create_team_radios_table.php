<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('team_radios', function (Blueprint $table) {
            $table->id();
            $table->integer('meeting_key');
            $table->integer('session_key');
            $table->integer('driver_number');
            $table->timestamp('date');
            $table->string('recording_url');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_radios');
    }
};
