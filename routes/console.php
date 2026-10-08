<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
|
| Run with: php artisan schedule:work   (or a system cron entry)
|   * * * * * cd /path/to/JAWEBNI && php artisan schedule:run >> /dev/null 2>&1
|
*/

Schedule::command('jawebni:booking-reminders --hours=24')
    ->hourly()
    ->withoutOverlapping();

Schedule::command('queue:prune-failed --hours=72')->daily();

Schedule::command('cache:prune-stale-tags')->hourly();
