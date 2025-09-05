<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('todos', function (Blueprint $table) {
        $table->id();
       // $table->foreignId('user_id')->constrained()->onDelete('cascade'); // dono da lista
        $table->string('user_name')->nullable();
        $table->string('title');
        $table->timestamps();
    });

    Schema::create('tasks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('todo_id')->constrained()->onDelete('cascade'); // pertence a um todo
        $table->string('title');
         $table->decimal('balance', 10, 2)->default(0); //recompensa da task
        $table->text('description')->nullable();
        $table->boolean('is_completed')->default(false);
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('tasks', function (Blueprint $table) {
        $table->dropForeign(['todo_id']);
    });
        Schema::dropIfExists('todos');
        Schema::dropIfExists('tasks');
    }
};
