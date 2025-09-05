<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Todo;

class TodoSeeder extends Seeder
{
    public function run(): void
    {
        $todos = [
            ['title' => 'Lista de Compras', 'user_name' => 'João'],
            ['title' => 'Estudos de Programação', 'user_name' => 'Maria'],
            ['title' => 'Tarefas do Trabalho', 'user_name' => 'Carlos'],
        ];



    foreach ($todos as $todoData) {
    $todo = new todo($todoData);
    $todo->saveConditionally();
    }
    }
}
