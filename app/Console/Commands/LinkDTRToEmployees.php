<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class LinkDTRToEmployees extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:link-d-t-r-to-employees';

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
        $employees = \App\Models\Employee::all();
        
        foreach ($employees as $employee) {
            \App\Models\DTRRecord::where('employee_name', $employee->name)
                ->update(['employee_id' => $employee->id]);
        }
        
        $this->info('DTR records linked to employees successfully.');
    }
}
