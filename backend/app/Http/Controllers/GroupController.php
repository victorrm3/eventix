<?php

namespace App\Http\Controllers;

use App\Models\EventGroup;
use App\Models\GroupMember;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class GroupController extends Controller
{
    /**
     * Obtener grupos públicos de un evento
     */
    public function index($eventId)
    {
        $event = Event::find($eventId);
        
        if (!$event) {
            return response()->json(['error' => 'Evento no encontrado'], 404);
        }

        $user = Auth::user();
        
        // Obtener grupos públicos
        $grupos = EventGroup::where('event_id', $eventId)
            ->where('visibility', 'public')
            ->with(['owner:id,name,email,profile_image', 'members'])
            ->get()
            ->map(function ($grupo) use ($user) {
                $miembrosCount = $grupo->members()->count();
                $esMiembro = $user ? $grupo->members()->where('user_id', $user->id)->exists() : false;
                
                return [
                    'id' => $grupo->id,
                    'nombre' => $grupo->name,
                    'lugarQuedada' => $grupo->meeting_point,
                    'visibilidad' => $grupo->visibility === 'public' ? 'publica' : 'privada',
                    'miembros' => $miembrosCount,
                    'esMiembro' => $esMiembro,
                    'owner' => [
                        'id' => $grupo->owner->id,
                        'name' => $grupo->owner->name,
                        'email' => $grupo->owner->email,
                    ],
                    'created_at' => $grupo->created_at,
                ];
            });

        return response()->json(['groups' => $grupos]);
    }

    /**
     * Crear un nuevo grupo
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|exists:events,id',
            'name' => 'required|string|max:255',
            'meeting_point' => 'required|string|max:255',
            'visibility' => 'required|in:public,private,publica,privada',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $user = Auth::user();
        $event = Event::find($request->event_id);

        if (!$event) {
            return response()->json(['error' => 'Evento no encontrado'], 404);
        }

        // Normalizar visibilidad
        $visibility = $request->visibility === 'publica' ? 'public' : ($request->visibility === 'privada' ? 'private' : $request->visibility);
        
        // Generar código de invitación si es privado
        $inviteCode = null;
        if ($visibility === 'private') {
            $inviteCode = EventGroup::generateInviteCode();
        }

        $grupo = EventGroup::create([
            'event_id' => $request->event_id,
            'owner_id' => $user->id,
            'name' => $request->name,
            'meeting_point' => $request->meeting_point,
            'visibility' => $visibility,
            'invite_code' => $inviteCode,
        ]);

        // Agregar al creador como miembro
        GroupMember::create([
            'group_id' => $grupo->id,
            'user_id' => $user->id,
        ]);

        $grupo->load(['owner:id,name,email,profile_image']);

        return response()->json([
            'message' => 'Grupo creado correctamente',
            'group' => [
                'id' => $grupo->id,
                'nombre' => $grupo->name,
                'lugarQuedada' => $grupo->meeting_point,
                'visibilidad' => $grupo->visibility === 'public' ? 'publica' : 'privada',
                'miembros' => 1,
                'enlace' => $inviteCode ? $inviteCode : null,
                'inviteUrl' => $inviteCode ? url("/grupos/{$request->event_id}?invite={$inviteCode}") : null,
            ],
        ], 201);
    }

    /**
     * Unirse a un grupo público
     */
    public function join($groupId)
    {
        $user = Auth::user();
        $grupo = EventGroup::find($groupId);

        if (!$grupo) {
            return response()->json(['error' => 'Grupo no encontrado'], 404);
        }

        // Verificar si ya es miembro
        $esMiembro = GroupMember::where('group_id', $groupId)
            ->where('user_id', $user->id)
            ->exists();

        if ($esMiembro) {
            return response()->json(['error' => 'Ya eres miembro de este grupo'], 400);
        }

        // Verificar que el grupo sea público
        if ($grupo->visibility !== 'public') {
            return response()->json(['error' => 'Este grupo es privado. Usa el enlace de invitación'], 403);
        }

        GroupMember::create([
            'group_id' => $groupId,
            'user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Te has unido al grupo correctamente']);
    }

    /**
     * Unirse a un grupo privado mediante código de invitación
     */
    public function joinByInvite(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'invite_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Código de invitación requerido'], 400);
        }

        $user = Auth::user();
        $grupo = EventGroup::where('invite_code', $request->invite_code)->first();

        if (!$grupo) {
            return response()->json(['error' => 'Código de invitación inválido'], 404);
        }

        // Verificar si ya es miembro
        $esMiembro = GroupMember::where('group_id', $grupo->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($esMiembro) {
            return response()->json(['error' => 'Ya eres miembro de este grupo'], 400);
        }

        GroupMember::create([
            'group_id' => $grupo->id,
            'user_id' => $user->id,
        ]);

        $grupo->load(['owner:id,name,email,profile_image']);

        return response()->json([
            'message' => 'Te has unido al grupo correctamente',
            'group' => [
                'id' => $grupo->id,
                'nombre' => $grupo->name,
                'lugarQuedada' => $grupo->meeting_point,
                'visibilidad' => $grupo->visibility === 'public' ? 'publica' : 'privada',
                'miembros' => $grupo->members()->count(),
            ],
        ]);
    }

    /**
     * Salir de un grupo
     */
    public function leave($groupId)
    {
        $user = Auth::user();
        $grupo = EventGroup::find($groupId);

        if (!$grupo) {
            return response()->json(['error' => 'Grupo no encontrado'], 404);
        }

        // No permitir que el dueño salga del grupo
        if ($grupo->owner_id === $user->id) {
            return response()->json(['error' => 'El propietario no puede salir del grupo'], 400);
        }

        $miembro = GroupMember::where('group_id', $groupId)
            ->where('user_id', $user->id)
            ->first();

        if (!$miembro) {
            return response()->json(['error' => 'No eres miembro de este grupo'], 400);
        }

        $miembro->delete();

        return response()->json(['message' => 'Has salido del grupo correctamente']);
    }

    /**
     * Obtener información de un grupo
     */
    public function show($groupId)
    {
        $user = Auth::user();
        $grupo = EventGroup::with(['owner:id,name,email,profile_image', 'members.user:id,name,email,profile_image'])
            ->find($groupId);

        if (!$grupo) {
            return response()->json(['error' => 'Grupo no encontrado'], 404);
        }

        $esMiembro = $user ? GroupMember::where('group_id', $groupId)
            ->where('user_id', $user->id)
            ->exists() : false;

        // Si es privado y no es miembro, no mostrar detalles
        if ($grupo->visibility === 'private' && !$esMiembro && $grupo->owner_id !== $user->id) {
            return response()->json(['error' => 'Este grupo es privado'], 403);
        }

        return response()->json([
            'group' => [
                'id' => $grupo->id,
                'nombre' => $grupo->name,
                'lugarQuedada' => $grupo->meeting_point,
                'visibilidad' => $grupo->visibility === 'public' ? 'publica' : 'privada',
                'miembros' => $grupo->members()->count(),
                'esMiembro' => $esMiembro,
                'esOwner' => $user && $grupo->owner_id === $user->id,
                'eventId' => $grupo->event_id,
                'invite_code' => $grupo->invite_code,
                'owner' => [
                    'id' => $grupo->owner->id,
                    'name' => $grupo->owner->name,
                    'email' => $grupo->owner->email,
                ],
                'members' => $grupo->members->map(function ($member) use ($grupo) {
                    $user = $member->user;

                    $profileImageUrl = null;
                    if ($user->profile_image) {
                        $profileImageUrl = Storage::disk('public')->url('profile_images/' . $user->profile_image);
                    }

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'profile_image' => $profileImageUrl,
                        'esCreador' => $user->id === $grupo->owner_id,
                        'joined_at' => $member->created_at,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Grupos a los que pertenece el usuario autenticado
     */
    public function myGroups()
    {
        $user = Auth::user();

        $grupos = EventGroup::whereHas('members', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->with(['event:id,title', 'members'])
            ->get()
            ->map(function ($grupo) use ($user) {
                return [
                    'id' => $grupo->id,
                    'nombre' => $grupo->name,
                    'lugarQuedada' => $grupo->meeting_point,
                    'visibilidad' => $grupo->visibility === 'public' ? 'publica' : 'privada',
                    'miembros' => $grupo->members()->count(),
                    'eventoId' => $grupo->event_id,
                    'eventoNombre' => $grupo->event ? $grupo->event->title : 'Evento',
                    'esOwner' => $user && $grupo->owner_id === $user->id,
                ];
            });

        return response()->json(['groups' => $grupos]);
    }
}

