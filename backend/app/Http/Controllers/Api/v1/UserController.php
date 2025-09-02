<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
class UserController extends Controller
{
      // Listar todos os usuários
    public function index()
    {
        return User::all();
    }

    // Mostrar um usuário específico
    public function show(User $user)
    {
        return $user;
    }

    // Criar um usuário
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create($data);

        return response()->json($user, 201);
    }

    // Atualizar usuário
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:6',
        ]);

        $user->update($data);

        return $user;
    }

    // Deletar usuário
    public function destroy(User $user)
    {
        $user->delete();
        return response()->noContent();
    }
}
