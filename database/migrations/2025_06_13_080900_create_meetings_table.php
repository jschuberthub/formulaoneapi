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
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->integer('meeting_key')->unique();
            $table->string('meeting_name');
            $table->string('meeting_official_name')->nullable();
            $table->string('circuit_short_name')->nullable();
            $table->string('country_code');
            $table->string('country_name');
            $table->string('location')->nullable();
            $table->integer('circuit_key');
            $table->integer('country_key');
            $table->dateTime('date_start');
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
        Schema::dropIfExists('meetings');
    }
};
