<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('f1_sessions', function (Blueprint $table) {
            $table->id();
            $table->integer('session_key')->unique();
            $table->string('session_name');
            $table->string('session_type');
            $table->integer('meeting_key');
            $table->integer('circuit_key');
            $table->string('circuit_short_name');
            $table->string('country_code');
            $table->integer('country_key');
            $table->string('country_name');
            $table->string('location');
            $table->dateTime('date_start');
            $table->dateTime('date_end');
            $table->string('gmt_offset')->nullable();
            $table->integer('year');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
