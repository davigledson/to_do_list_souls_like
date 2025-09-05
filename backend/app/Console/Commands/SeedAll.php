<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SeedAll extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:seed-all';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $connections = ['mysql', 'pgsql', 'sqlite'];

        foreach ($connections as $connection) {
            $this->info("Rodando seed em [$connection]...");

            Artisan::call('db:seed', [
                '--database' => $connection,


            ]);

            $this->line(Artisan::output());
        }

        $this->info("Seed finalizado em todos os bancos!");
    }
}
