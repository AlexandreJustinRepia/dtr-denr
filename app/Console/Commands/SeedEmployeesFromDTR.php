<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SeedEmployeesFromDTR extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:seed-employees-from-d-t-r';

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
        $uniqueEmployees = \App\Models\DTRRecord::select('employee_name', 'status')
            ->distinct()
            ->get();
            
        foreach ($uniqueEmployees as $record) {
            \App\Models\Employee::firstOrCreate(
                ['name' => $record->employee_name],
                ['status' => $record->status]
            );
        }
        
        $this->info('Employees seeded successfully from DTR records.');
    }
}
