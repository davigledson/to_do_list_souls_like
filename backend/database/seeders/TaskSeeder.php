<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Task;
use App\Models\Todo;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $todo1 = Todo::firstWhere('title', 'Lista de Compras');
        $todo2 = Todo::firstWhere('title', 'Estudos de Programação');

        $tasks = [
            [
                'todo_id' => $todo1?->id,
                'title' => 'Comprar arroz',
                'description' => 'Pacote de 5kg',
                'is_completed' => false,
            ],
            [
                'todo_id' => $todo1?->id,
                'title' => 'Comprar leite',
                'description' => 'Caixa de 12 unidades',
                'is_completed' => true,
            ],
            [
                'todo_id' => $todo2?->id,
                'title' => 'Estudar Laravel',
                'description' => 'Focar em migrations e seeders',
                'is_completed' => false,
            ],
        ];

       foreach ($tasks as $taskData) {
    $task = new Task($taskData);
    $task->saveConditionally();
    }

    }


}
