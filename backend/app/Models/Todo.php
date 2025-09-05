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

        // Replicar no MySQL
        DB::connection('mysql')->table($this->table)->insert([
            'title'      => $this->title,
            'user_id'    => $this->user_id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Replicar no SQLite
        DB::connection('sqlite')->table($this->table)->insert([
            'title'      => $this->title,
            'user_id'    => $this->user_id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
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
