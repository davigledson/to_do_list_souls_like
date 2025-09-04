<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Todo;

class TodoController extends Controller
{
    public function index()
    {
        return Todo::with('tasks')->get(); // inclui as tasks
    }

    public function show(Todo $todo)
    {
        return $todo->load('tasks');
    }

    public function store(Request $request)
    {
        $data = $request->all();

        $todo = Todo::create($data);

        return response()->json($todo, 201);
    }

    public function update(Request $request, Todo $todo)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
        ]);

        $todo->update($data);

        return $todo;
    }

    public function destroy(Todo $todo)
    {
        $todo->delete();
        return response()->noContent();
    }

}
