<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MigrateAll extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-all {--rollback} {--refresh} {--seed}';

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
        $connections = ['pgsql', 'mysql', 'sqlite'];

        foreach ($connections as $connection) {
            if ($this->option('rollback')) {
                $this->info(" Rollback no banco: $connection");
                $this->call('migrate:rollback', [
                    '--database' => $connection,
                    '--force' => true,
                ]);
            } elseif ($this->option('refresh')) {
                $this->info(" Refresh no banco: $connection");
                $this->call('migrate:refresh', [
                    '--database' => $connection,
                    '--force' => true,
                ]);
            } else {
                $this->info("Rodando migrations no banco: $connection");
                $this->call('migrate', [
                    '--database' => $connection,
                    '--force' => true,
                ]);
            }

            if ($this->option('seed')) {
                $this->info(" Rodando seeds no banco: $connection");
                $this->call('db:seed', [
                    '--database' => $connection,
                    '--force' => true,
                ]);
            }
        }

        $this->info(' Operação finalizada em todos os bancos!');
        return Command::SUCCESS;
    }
}
