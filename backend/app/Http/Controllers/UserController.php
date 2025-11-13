<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friend;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Actualizar perfil de usuario
     * PUT /api/user/profile
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        // Recargar el usuario para obtener datos actualizados
        $user->refresh();

        return response()->json([
            'message' => 'Perfil actualizado',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'profile_image' => $user->profile_image ? Storage::disk('public')->url('profile_images/' . $user->profile_image) : null,
            ],
        ]);
    }

    /**
     * Actualizar foto de perfil
     * POST /api/user/profile-image
     */
    public function updateProfileImage(Request $request)
    {
        $request->validate([
            'profile_image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        $user = Auth::user();

        // Eliminar imagen anterior si existe
        if ($user->profile_image) {
            Storage::disk('public')->delete('profile_images/' . $user->profile_image);
        }

        // Guardar nueva imagen
        $image = $request->file('profile_image');
        $imageName = time() . '_' . $user->id . '.' . $image->getClientOriginalExtension();
        $imagePath = $image->storeAs('profile_images', $imageName, 'public');

        // Actualizar en base de datos
        $user->profile_image = $imageName;
        $user->save();

        // Recargar el usuario para obtener datos actualizados
        $user->refresh();

        // URL completa de la imagen usando Storage::url() para generar la URL correcta
        $imageUrl = Storage::disk('public')->url('profile_images/' . $imageName);

        return response()->json([
            'message' => 'Imagen actualizada',
            'image_url' => $imageUrl,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'profile_image' => $imageUrl,
            ],
        ]);
    }

    /**
     * Cambiar contraseña
     * PUT /api/user/password
     */
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8'],
        ]);

        $user = Auth::user();

        // Verificar contraseña actual
        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual es incorrecta'],
            ]);
        }

        // Actualizar contraseña
        $user->password = $validated['new_password'];
        $user->save();

        return response()->json([
            'message' => 'Contraseña actualizada',
        ]);
    }

    /**
     * Obtener amigos del usuario (no implementado aún)
     * GET /api/user/friends
     */
    public function getFriends()
    {
        $user = Auth::user();

        $friends = $user->friends()->select('id', 'name', 'email')->get();

        return response()->json([
            'friends' => $friends,
        ]);
    }

    /**
     * Agregar amigo (no implementado aún)
     * POST /api/user/friends
     */
    public function addFriend(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'exists:users,email'],
        ]);

        $user = Auth::user();

        // Buscar usuario por email
        $friendUser = User::where('email', $validated['email'])->first();

        // No se puede agregar a sí mismo
        if ($friendUser->id === $user->id) {
            return response()->json([
                'message' => 'No puedes agregarte a ti mismo como amigo',
            ], 400);
        }

        // Verificar si ya es amigo
        $existingFriend = Friend::where('user_id', $user->id)
            ->where('friend_id', $friendUser->id)
            ->first();

        if ($existingFriend) {
            return response()->json([
                'message' => 'Este usuario ya es tu amigo',
            ], 400);
        }

        // Crear la amistad (relación bidireccional)
        Friend::create([
            'user_id' => $user->id,
            'friend_id' => $friendUser->id,
        ]);

        return response()->json([
            'message' => 'Solicitud enviada',
            'friend' => [
                'id' => $friendUser->id,
                'name' => $friendUser->name,
                'email' => $friendUser->email,
            ],
        ]);
    }

    /**
     * Eliminar amigo
     * DELETE /api/user/friends/{id}
     */
    public function removeFriend($id)
    {
        $user = Auth::user();

        $friend = Friend::where('user_id', $user->id)
            ->where('friend_id', $id)
            ->first();

        if (!$friend) {
            return response()->json([
                'message' => 'Amistad no encontrada',
            ], 404);
        }

        $friend->delete();

        return response()->json([
            'message' => 'Amistad eliminada',
        ]);
    }

    /**
     * Obtener mis entradas
     * GET /api/user/tickets
     */
    public function getTickets()
    {
        $user = Auth::user();

        $tickets = Ticket::where('user_id', $user->id)
            ->with('event:id,title,date,location')
            ->select('id', 'event_id', 'price', 'status', 'qr_code')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'event_title' => $ticket->event->title ?? null,
                    'event_date' => $ticket->event->date ?? null,
                    'event_location' => $ticket->event->location ?? null,
                    'price' => $ticket->price,
                    'status' => $ticket->status,
                    'qr_code' => $ticket->qr_code,
                ];
            });

        return response()->json([
            'tickets' => $tickets,
        ]);
    }
}