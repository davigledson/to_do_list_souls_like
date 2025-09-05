<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Todo extends Model
{
    protected $table = 'todos';
    protected $fillable = ['title', 'user_name'];

    /**
     * Salva no Postgres (padrão) e replica em MySQL + SQLite
     */
    public function saveWithReplication(array $options = [])
    {
        // Salva no banco padrão (pgsql)
        parent::save($options);

        $data = [
            'title'      => $this->title,

            'created_at' => now(),
            'updated_at' => now(),
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
     * Relação: um Todo tem várias Tasks
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Relação: um Todo pertence a um User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
