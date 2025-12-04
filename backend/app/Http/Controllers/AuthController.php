<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    //Función de registrar un usuario
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            //Mínimo 8 caracteres para poder guardar la contraseña
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            // El modelo User tiene 'password' => 'hashed', así que basta el plano
            'password' => $validated['password'],
            'role' => 'user',
        ]);

        // Crea un token usando Laravel Sanctum que servirá para validar al usuario en peticiones posteriores
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                //Si el usuario tiene imagen de perfil, devuelve la URL pública
                'profile_image' => $user->profile_image ? \Illuminate\Support\Facades\Storage::disk('public')->url('profile_images/' . $user->profile_image) : null,
            ],
        ], 201);
    }
    //Función para el login
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);
        //Validar
        if (!Auth::attempt(['email' => $validated['email'], 'password' => $validated['password']])) {
            return response()->json([
                'message' => 'Credenciales inválidas',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken; // Se genera un nuevo token para esta sesión

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'profile_image' => $user->profile_image ? \Illuminate\Support\Facades\Storage::disk('public')->url('profile_images/' . $user->profile_image) : null,
            ],
        ]);
    }
}