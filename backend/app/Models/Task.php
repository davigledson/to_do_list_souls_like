<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Task extends Model
{
    protected $table = 'tasks';
    protected $fillable = ['title', 'description', 'is_completed'];

    /**
     * Salva no Postgres (padrão) e replica em MySQL + SQLite
     */
    public function saveWithReplication(array $options = [])
    {
        // Salva no banco padrão (pgsql)
        parent::save($options);

        // Replicar no MySQL
        DB::connection('mysql')->table($this->table)->insert([
            'title'        => $this->title,
            'description'  => $this->description,
            'is_completed' => $this->is_completed,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        // Replicar no SQLite
        DB::connection('sqlite')->table($this->table)->insert([
            'title'        => $this->title,
            'description'  => $this->description,
            'is_completed' => $this->is_completed,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
    }

    public function user()
{
    return $this->belongsTo(User::class);
}

}
