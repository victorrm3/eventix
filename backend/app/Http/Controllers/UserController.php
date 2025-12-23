<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friend;
use App\Models\FriendRequest;
use App\Models\Favorite;
use App\Models\Achievement;
use App\Models\Ticket;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Actualizar perfil de usuario
     * PUT /api/user/profile
     */
    public function actualizarPerfil(Request $request)
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
    public function actualizarImagenPerfil(Request $request)
    {
        // Verificar si el archivo se está recibiendo
        if (!$request->hasFile('profile_image')) {
            return response()->json([
                'message' => 'No se recibió ningún archivo',
                'errors' => ['profile_image' => ['El campo profile_image es requerido y debe ser un archivo']]
            ], 422);
        }

        $request->validate([
            'profile_image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'mimetypes:image/jpeg,image/png,image/jpg,image/gif,image/x-png', 'max:2048'],
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
    public function cambiarContrasena(Request $request)
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
     * Obtener amigos del usuario
     * GET /api/user/friends
     */
    public function obtenerAmigos()
    {
        $user = Auth::user();

        // Obtener amigos usando consulta directa para evitar problemas con timestamps
        $friends = User::whereIn('id', function ($query) use ($user) {
            $query->select('friend_id')
                ->from('friends')
                ->where('user_id', $user->id);
        })->select('id', 'name', 'email', 'profile_image')->get()
        ->map(function ($friend) {
            return [
                'id' => $friend->id,
                'name' => $friend->name,
                'email' => $friend->email,
                'profile_image' => $friend->profile_image ? Storage::disk('public')->url('profile_images/' . $friend->profile_image) : null,
            ];
        });

        return response()->json([
            'friends' => $friends,
        ]);
    }

    /**
     * Buscar usuarios por email
     * GET /api/user/search?email=...
     */
    public function buscarUsuarios(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = Auth::user();
        $email = $validated['email'];

        // Buscar usuarios que coincidan con el email (parcial)
        $usuarios = User::where('email', 'like', '%' . $email . '%')
            ->where('id', '!=', $user->id)
            ->select('id', 'name', 'email', 'profile_image')
            ->limit(10)
            ->get()
            ->map(function ($usuario) use ($user) {
                // Verificar si ya es amigo
                $esAmigo = Friend::where(function ($query) use ($user, $usuario) {
                    $query->where('user_id', $user->id)
                        ->where('friend_id', $usuario->id);
                })->orWhere(function ($query) use ($user, $usuario) {
                    $query->where('user_id', $usuario->id)
                        ->where('friend_id', $user->id);
                })->exists();

                // Verificar si hay solicitud pendiente
                $solicitudPendiente = FriendRequest::where(function ($query) use ($user, $usuario) {
                    $query->where('sender_id', $user->id)
                        ->where('receiver_id', $usuario->id)
                        ->where('status', 'pending');
                })->orWhere(function ($query) use ($user, $usuario) {
                    $query->where('sender_id', $usuario->id)
                        ->where('receiver_id', $user->id)
                        ->where('status', 'pending');
                })->exists();

                return [
                    'id' => $usuario->id,
                    'name' => $usuario->name,
                    'email' => $usuario->email,
                    'profile_image' => $usuario->profile_image ? Storage::disk('public')->url('profile_images/' . $usuario->profile_image) : null,
                    'es_amigo' => $esAmigo,
                    'solicitud_pendiente' => $solicitudPendiente,
                ];
            });

        return response()->json([
            'usuarios' => $usuarios,
        ]);
    }

    /**
     * Enviar solicitud de amistad
     * POST /api/user/friend-requests
     */
    public function enviarSolicitud(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = Auth::user();
        $receiverId = $validated['receiver_id'];

        // No se puede enviar solicitud a sí mismo
        if ($receiverId === $user->id) {
            return response()->json([
                'message' => 'No puedes enviarte una solicitud a ti mismo',
            ], 400);
        }

        // Verificar si ya es amigo
        $esAmigo = Friend::where(function ($query) use ($user, $receiverId) {
            $query->where('user_id', $user->id)
                ->where('friend_id', $receiverId);
        })->orWhere(function ($query) use ($user, $receiverId) {
            $query->where('user_id', $receiverId)
                ->where('friend_id', $user->id);
        })->exists();

        if ($esAmigo) {
            return response()->json([
                'message' => 'Este usuario ya es tu amigo',
            ], 400);
        }

        // Verificar si ya existe una solicitud pendiente
        $solicitudPendiente = FriendRequest::where(function ($query) use ($user, $receiverId) {
            $query->where('sender_id', $user->id)
                ->where('receiver_id', $receiverId)
                ->where('status', 'pending');
        })->orWhere(function ($query) use ($user, $receiverId) {
            $query->where('sender_id', $receiverId)
                ->where('receiver_id', $user->id)
                ->where('status', 'pending');
        })->first();

        if ($solicitudPendiente) {
            return response()->json([
                'message' => 'Ya existe una solicitud pendiente con este usuario',
            ], 400);
        }

        // Usar transacción para asegurar atomicidad
        try {
            DB::beginTransaction();

            // Eliminar cualquier solicitud existente que no sea pendiente (rechazada o aceptada)
            // Esto evita conflictos con el constraint único
            FriendRequest::where(function ($query) use ($user, $receiverId) {
                $query->where('sender_id', $user->id)
                    ->where('receiver_id', $receiverId)
                    ->whereIn('status', ['rejected', 'accepted']);
            })->orWhere(function ($query) use ($user, $receiverId) {
                $query->where('sender_id', $receiverId)
                    ->where('receiver_id', $user->id)
                    ->whereIn('status', ['rejected', 'accepted']);
            })->delete();

            // Crear la nueva solicitud
            $friendRequest = FriendRequest::create([
                'sender_id' => $user->id,
                'receiver_id' => $receiverId,
                'status' => 'pending',
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al crear solicitud de amistad: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'receiver_id' => $receiverId,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al crear la solicitud. Por favor, intenta de nuevo.',
            ], 500);
        }

        return response()->json([
            'message' => 'Solicitud de amistad enviada',
            'request' => $friendRequest->load('receiver:id,name,email'),
        ]);
    }

    /**
     * Obtener solicitudes de amistad pendientes
     * GET /api/user/friend-requests
     */
    public function obtenerSolicitudes(Request $request)
    {
        $user = Auth::user();

        // Solicitudes recibidas (pendientes)
        $solicitudesRecibidas = FriendRequest::where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->with('sender:id,name,email,profile_image')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'sender' => [
                        'id' => $request->sender->id,
                        'name' => $request->sender->name,
                        'email' => $request->sender->email,
                        'profile_image' => $request->sender->profile_image ? Storage::disk('public')->url('profile_images/' . $request->sender->profile_image) : null,
                    ],
                    'created_at' => $request->created_at,
                ];
            });

        return response()->json([
            'solicitudes' => $solicitudesRecibidas,
        ]);
    }

    /**
     * Obtener contador de solicitudes pendientes
     * GET /api/user/friend-requests/count
     */
    public function obtenerContadorSolicitudes()
    {
        $user = Auth::user();

        $count = FriendRequest::where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'count' => $count,
        ]);
    }

    /**
     * Aceptar solicitud de amistad
     * PUT /api/user/friend-requests/{id}/accept
     */
    public function aceptarSolicitud($id)
    {
        $user = Auth::user();

        $friendRequest = FriendRequest::where('id', $id)
            ->where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendRequest) {
            return response()->json([
                'message' => 'Solicitud no encontrada',
            ], 404);
        }

        // Actualizar estado de la solicitud
        $friendRequest->status = 'accepted';
        $friendRequest->save();

        // Crear la amistad bidireccional
        Friend::create([
            'user_id' => $friendRequest->sender_id,
            'friend_id' => $friendRequest->receiver_id,
        ]);

        // También crear la relación inversa
        Friend::create([
            'user_id' => $friendRequest->receiver_id,
            'friend_id' => $friendRequest->sender_id,
        ]);

        return response()->json([
            'message' => 'Solicitud aceptada',
        ]);
    }

    /**
     * Rechazar solicitud de amistad
     * PUT /api/user/friend-requests/{id}/reject
     */
    public function rechazarSolicitud($id)
    {
        $user = Auth::user();

        $friendRequest = FriendRequest::where('id', $id)
            ->where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendRequest) {
            return response()->json([
                'message' => 'Solicitud no encontrada',
            ], 404);
        }

        // Actualizar estado de la solicitud
        $friendRequest->status = 'rejected';
        $friendRequest->save();

        return response()->json([
            'message' => 'Solicitud rechazada',
        ]);
    }

    /**
     * Agregar amigo (método antiguo - mantener para compatibilidad)
     * POST /api/user/friends
     */
    public function agregarAmigo(Request $request)
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

        // Verificar si ya es amigo (en cualquier dirección)
        $existingFriend = Friend::where(function ($query) use ($user, $friendUser) {
            $query->where('user_id', $user->id)
                  ->where('friend_id', $friendUser->id);
        })->orWhere(function ($query) use ($user, $friendUser) {
            $query->where('user_id', $friendUser->id)
                  ->where('friend_id', $user->id);
        })->first();

        if ($existingFriend) {
            return response()->json([
                'message' => 'Este usuario ya es tu amigo',
            ], 400);
        }

        // Crear la amistad bidireccional (ambas direcciones)
        Friend::create([
            'user_id' => $user->id,
            'friend_id' => $friendUser->id,
        ]);

        Friend::create([
            'user_id' => $friendUser->id,
            'friend_id' => $user->id,
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
    public function eliminarAmigo($id)
    {
        $user = Auth::user();

        // Verificar que existe la amistad
        $friend = Friend::where('user_id', $user->id)
            ->where('friend_id', $id)
            ->first();

        if (!$friend) {
            return response()->json([
                'message' => 'Amistad no encontrada',
            ], 404);
        }

        // Eliminar ambas direcciones de la amistad (bidireccional)
        Friend::where(function ($query) use ($user, $id) {
            $query->where('user_id', $user->id)
                  ->where('friend_id', $id);
        })->orWhere(function ($query) use ($user, $id) {
            $query->where('user_id', $id)
                  ->where('friend_id', $user->id);
        })->delete();

        // También eliminar las solicitudes de amistad relacionadas (accepted o rejected)
        // para permitir que puedan volver a enviarse solicitudes en el futuro
        FriendRequest::where(function ($query) use ($user, $id) {
            $query->where('sender_id', $user->id)
                  ->where('receiver_id', $id);
        })->orWhere(function ($query) use ($user, $id) {
            $query->where('sender_id', $id)
                  ->where('receiver_id', $user->id);
        })->delete();

        return response()->json([
            'message' => 'Amistad eliminada',
        ]);
    }

    /**
     * Obtener mis entradas
     * GET /api/user/tickets
     */
    public function obtenerEntradas()
    {
        $user = Auth::user();

        $tickets = Ticket::where('user_id', $user->id)
            ->with('event:id,title,date,location,price')
            ->select('id', 'event_id', 'status', 'qr_code')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'event_id' => $ticket->event_id,
                    'event_title' => $ticket->event->title ?? null,
                    'event_date' => $ticket->event->date ?? null,
                    'event_location' => $ticket->event->location ?? null,
                    'price' => $ticket->event->price ?? null,
                    'status' => $ticket->status,
                    'qr_code' => $ticket->qr_code,
                ];
            });

        return response()->json([
            'tickets' => $tickets,
        ]);
    }

    /**
     * Obtener favoritos del usuario
     * GET /api/user/favorites
     */
    public function obtenerFavoritos()
    {
        $user = Auth::user();

        $favoritos = Favorite::where('user_id', $user->id)
            ->with('event:id,title,description,date,time,location,price,image_url,capacity')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($favorite) {
                return [
                    'id' => $favorite->id,
                    'event_id' => $favorite->event_id,
                    'event' => $favorite->event ? [
                        'id' => $favorite->event->id,
                        'title' => $favorite->event->title,
                        'description' => $favorite->event->description,
                        'date' => $favorite->event->date,
                        'time' => $favorite->event->time,
                        'location' => $favorite->event->location,
                        'price' => $favorite->event->price,
                        'image_url' => $favorite->event->image_url,
                        'capacity' => $favorite->event->capacity,
                    ] : null,
                    'created_at' => $favorite->created_at,
                ];
            });

        return response()->json([
            'favorites' => $favoritos,
        ]);
    }

    /**
     * Agregar evento a favoritos
     * POST /api/user/favorites
     */
    public function agregarFavorito(Request $request)
    {
        $validated = $request->validate([
            'event_id' => ['required', 'integer', 'exists:events,id'],
        ]);

        $user = Auth::user();

        // Verificar si ya está en favoritos
        $favoritoExistente = Favorite::where('user_id', $user->id)
            ->where('event_id', $validated['event_id'])
            ->first();

        if ($favoritoExistente) {
            return response()->json([
                'message' => 'Este evento ya está en tus favoritos',
            ], 400);
        }

        // Crear el favorito
        $favorito = Favorite::create([
            'user_id' => $user->id,
            'event_id' => $validated['event_id'],
        ]);

        return response()->json([
            'message' => 'Evento agregado a favoritos',
            'favorite' => $favorito,
        ]);
    }

    /**
     * Eliminar evento de favoritos
     * DELETE /api/user/favorites/{eventId}
     */
    public function eliminarFavorito($eventId)
    {
        $user = Auth::user();

        $favorito = Favorite::where('user_id', $user->id)
            ->where('event_id', $eventId)
            ->first();

        if (!$favorito) {
            return response()->json([
                'message' => 'Favorito no encontrado',
            ], 404);
        }

        $favorito->delete();

        return response()->json([
            'message' => 'Evento eliminado de favoritos',
        ]);
    }

    /**
     * Verificar si un evento está en favoritos
     * GET /api/user/favorites/{eventId}/check
     */
    public function verificarFavorito($eventId)
    {
        $user = Auth::user();

        $esFavorito = Favorite::where('user_id', $user->id)
            ->where('event_id', $eventId)
            ->exists();

        return response()->json([
            'is_favorite' => $esFavorito,
        ]);
    }

    /**
     * Obtener favoritos de un usuario específico (para ver favoritos de amigos)
     * GET /api/user/{userId}/favorites
     */
    public function obtenerFavoritosUsuario($userId)
    {
        $currentUser = Auth::user();

        // Verificar que el usuario solicitado es amigo del usuario actual
        $esAmigo = Friend::where(function ($query) use ($currentUser, $userId) {
            $query->where('user_id', $currentUser->id)
                ->where('friend_id', $userId);
        })->orWhere(function ($query) use ($currentUser, $userId) {
            $query->where('user_id', $userId)
                ->where('friend_id', $currentUser->id);
        })->exists();

        if (!$esAmigo) {
            return response()->json([
                'message' => 'No puedes ver los favoritos de este usuario',
            ], 403);
        }

        $favoritos = Favorite::where('user_id', $userId)
            ->with('event:id,title,description,date,time,location,price,image_url,capacity')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($favorite) {
                return [
                    'id' => $favorite->id,
                    'event_id' => $favorite->event_id,
                    'event' => $favorite->event ? [
                        'id' => $favorite->event->id,
                        'title' => $favorite->event->title,
                        'description' => $favorite->event->description,
                        'date' => $favorite->event->date,
                        'time' => $favorite->event->time,
                        'location' => $favorite->event->location,
                        'price' => $favorite->event->price,
                        'image_url' => $favorite->event->image_url,
                        'capacity' => $favorite->event->capacity,
                    ] : null,
                    'created_at' => $favorite->created_at,
                ];
            });

        return response()->json([
            'favorites' => $favoritos,
        ]);
    }

    /**
     * Obtener logros del usuario con progreso
     * GET /api/user/achievements
     */
    public function obtenerLogros()
    {
        $user = Auth::user();

        // Definir todos los logros disponibles
        $tiposLogros = [
            'first_ticket' => [
                'titulo' => 'Primera Entrada',
                'descripcion' => 'Compra tu primera entrada para un evento',
                'objetivo' => 1,
            ],
            'tickets_5' => [
                'titulo' => 'Comprador Frecuente',
                'descripcion' => 'Compra 5 entradas',
                'objetivo' => 5,
            ],
            'tickets_10' => [
                'titulo' => 'Fanático de Eventos',
                'descripcion' => 'Compra 10 entradas',
                'objetivo' => 10,
            ],
            'first_review' => [
                'titulo' => 'Crítico',
                'descripcion' => 'Escribe tu primera reseña',
                'objetivo' => 1,
            ],
            'reviews_5' => [
                'titulo' => 'Reseñador Experto',
                'descripcion' => 'Escribe 5 reseñas',
                'objetivo' => 5,
            ],
            'first_friend' => [
                'titulo' => 'Social',
                'descripcion' => 'Agrega tu primer amigo',
                'objetivo' => 1,
            ],
            'friends_5' => [
                'titulo' => 'Popular',
                'descripcion' => 'Agrega 5 amigos',
                'objetivo' => 5,
            ],
            'first_favorite' => [
                'titulo' => 'Coleccionista',
                'descripcion' => 'Agrega tu primer evento a favoritos',
                'objetivo' => 1,
            ],
            'favorites_10' => [
                'titulo' => 'Amante de Eventos',
                'descripcion' => 'Agrega 10 eventos a favoritos',
                'objetivo' => 10,
            ],
        ];

        // Obtener logros desbloqueados del usuario
        $logrosDesbloqueados = Achievement::where('user_id', $user->id)
            ->pluck('type')
            ->toArray();

        // Calcular progreso para cada logro
        $logros = [];
        foreach ($tiposLogros as $tipo => $info) {
            $desbloqueado = in_array($tipo, $logrosDesbloqueados);
            $progreso = 0;

            // Calcular progreso según el tipo de logro
            switch ($tipo) {
                case 'first_ticket':
                case 'tickets_5':
                case 'tickets_10':
                    $progreso = Ticket::where('user_id', $user->id)->count();
                    break;
                case 'first_review':
                case 'reviews_5':
                    $progreso = DB::table('reviews')->where('user_id', $user->id)->count();
                    break;
                case 'first_friend':
                case 'friends_5':
                    $progreso = Friend::where('user_id', $user->id)->count();
                    break;
                case 'first_favorite':
                case 'favorites_10':
                    $progreso = Favorite::where('user_id', $user->id)->count();
                    break;
            }

            // Si el progreso alcanza el objetivo pero no está desbloqueado, desbloquearlo
            if ($progreso >= $info['objetivo'] && !$desbloqueado) {
                Achievement::create([
                    'user_id' => $user->id,
                    'type' => $tipo,
                    'unlocked_at' => now(),
                ]);
                $desbloqueado = true;
            }

            // Obtener fecha de desbloqueo si está desbloqueado
            $unlockedAt = null;
            if ($desbloqueado) {
                $achievement = Achievement::where('user_id', $user->id)
                    ->where('type', $tipo)
                    ->first();
                $unlockedAt = $achievement ? $achievement->unlocked_at : null;
            }

            $logros[] = [
                'id' => $tipo,
                'type' => $tipo,
                'titulo' => $info['titulo'],
                'descripcion' => $info['descripcion'],
                'desbloqueado' => $desbloqueado,
                'progreso' => min($progreso, $info['objetivo']),
                'objetivo' => $info['objetivo'],
                'unlocked_at' => $unlockedAt,
            ];
        }

        return response()->json([
            'achievements' => $logros,
        ]);
    }
}