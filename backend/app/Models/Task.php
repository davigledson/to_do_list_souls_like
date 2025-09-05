<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Task extends Model
{
    protected $table = 'tasks';
    protected $fillable = ['todo_id','title', 'description', 'is_completed'];

    /**
     * Salva no Postgres (padrão) e replica em MySQL + SQLite
     */
    public function saveWithReplication(array $options = [])
    {
        // Salva no banco padrão (pgsql)
        parent::save($options);

        $data = [
            'todo_id'      => $this->todo_id,
            'title'        => $this->title,
            'description'  => $this->description,
            'is_completed' => $this->is_completed,
            'created_at'   => now(),
            'updated_at'   => now(),
        ];

        // Replicar nos outros bancos
        DB::connection('mysql')->table($this->table)->insert($data);
        DB::connection('sqlite')->table($this->table)->insert($data);
    }

    public function saveConditionally(array $options = [])
{
    $connections = config('database.connections');

    if (count($connections) > 1) { // mais de uma conexão
        $this->saveWithReplication($options);
    } else {
        $this->save($options);
    }
}

    /**
     * Relação: Task pertence a um Todo
     */
    public function todo()
    {
        return $this->belongsTo(Todo::class);
    }
}
