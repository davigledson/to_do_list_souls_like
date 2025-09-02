<?php

use App\Http\Controllers\Api\v1\UserController;
use App\Http\Controllers\Api\v1\TodoController;
use App\Http\Controllers\Api\v1\TaskController;

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
   Route::apiResource('users', UserController::class);
Route::apiResource('todos', TodoController::class);
Route::apiResource('tasks', TaskController::class);
});

Route::get('teste', function() {
    return 'rota funcionando!';
});
