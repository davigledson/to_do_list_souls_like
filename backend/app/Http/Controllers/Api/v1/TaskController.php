<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\User; // se você tem User vinculado
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function index()
    {
        return Task::all();
    }

    public function show(Task $task)
    {
        return $task;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
           
            'description' => 'nullable|string',
            'is_completed' => 'boolean',
        ]);

        $task = Task::create($data);

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_completed' => 'sometimes|boolean',
        ]);

        // antes da atualização, verifica se a task ainda NÃO estava concluída
        $wasCompleted = $task->is_completed;

        $task->update($data);

        // se antes não estava concluída e agora foi concluída → recompensa o usuário
        if (!$wasCompleted && $task->is_completed) {
            $this->rewardUser($task->todo->user_id);
        }

        return $task;
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->noContent();
    }

    private function rewardUser($userId)
    {
        $user = User::find($userId);

        if ($user) {
            // adiciona 10 moedas (pode ser configurável)
            $user->balance = $user->balance + 10;
            $user->save();
        }
    }
}
