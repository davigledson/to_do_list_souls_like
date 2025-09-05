<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Todo;
use SimpleXMLElement;

class TodoController extends Controller
{
    public function index()
    {
        return Todo::with('tasks')->get(); // inclui as tasks
    }
public function indexXml()
{
    $todos = Todo::with('tasks')->get();

    $xml = new \SimpleXMLElement('<todos/>');

    foreach ($todos as $todo) {
        $todoNode = $xml->addChild('todo');
        $todoNode->addChild('id', $todo->id);
        $todoNode->addChild('title', $todo->title);
        $todoNode->addChild('user_name', $todo->user_name);
        $todoNode->addChild('created_at', $todo->created_at);

        $tasksNode = $todoNode->addChild('tasks');
        foreach ($todo->tasks as $task) {
            $taskNode = $tasksNode->addChild('task');
            $taskNode->addChild('id', $task->id);
            $taskNode->addChild('title', $task->title);
            $taskNode->addChild('description', $task->description);
            $taskNode->addChild('is_completed', $task->is_completed ? 'true' : 'false');
        }
    }

    return response($xml->asXML(), 200)->header('Content-Type', 'application/xml');
}


    public function show(Todo $todo)
    {
        return $todo->load('tasks');
    }

     public function showXml(Todo $todo)
    {
        $data = $todo->load('tasks')->toArray();

        $xml = new SimpleXMLElement('<todo/>');
        array_walk_recursive($data, function($value, $key) use ($xml) {
            $xml->addChild($key, htmlspecialchars($value));
        });

        return response($xml->asXML(), 200)
            ->header('Content-Type', 'application/xml');
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
