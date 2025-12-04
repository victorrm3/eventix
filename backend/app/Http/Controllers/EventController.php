<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    /**
     * Obtener todos los eventos (todos los eventos son públicos)
     */
    public function index(Request $request)
    {
        $query = Event::with('creator:id,name,email,profile_image');

        // Búsqueda
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Filtro por categoría
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Eventos destacados
        if ($request->boolean('featured')) {
            $query->withCount('tickets as attendees_count')
                  ->orderBy('attendees_count', 'desc')
                  ->limit(6);
        } else {
            $query->withCount('tickets as attendees_count')
                  ->orderBy('date', 'asc');
        }

        $events = $query->get()->map(fn($event) => $this->formatearEvento($event, true));

        return response()->json([
            'success' => true,
            'events' => $events
        ]);
    }

    /**
     * Obtener detalle de un evento (todos los eventos son públicos)
     */
    public function show($id)
    {
        $event = Event::with('creator:id,name,email,profile_image')
                     ->withCount('tickets as attendees_count')
                     ->find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Evento no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'event' => $this->formatearEvento($event, true)
        ]);
    }

    /**
     * Crear un nuevo evento (solo admins)
     */
    public function store(Request $request)
    {
        if (!$this->esAdmin()) {
            return $this->respuestaNoAutorizada('No tienes permisos para crear eventos');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date' => ['required', 'date', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
            'location' => ['required', 'string', 'max:255'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'capacity' => ['required', 'integer', 'min:1'],
            'category' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'shareable' => ['nullable', 'boolean'],
            'image_url' => ['nullable', 'string', 'max:500'],
        ]);

        $event = Event::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'date' => $validated['date'],
            'time' => $this->normalizarTiempo($validated['time']),
            'location' => $validated['location'],
            'lat' => $validated['lat'] ?? null,
            'lng' => $validated['lng'] ?? null,
            'capacity' => $validated['capacity'],
            'category' => $validated['category'] ?? null,
            'price' => $validated['price'] ?? 0,
            'shareable' => $validated['shareable'] ?? false,
            'image_url' => $validated['image_url'] ?? null,
            'created_by' => Auth::id(),
        ]);

        $event->loadCount('tickets as attendees_count');

        return response()->json($this->formatearEvento($event, false), 201);
    }

    /**
     * Actualizar un evento existente (solo admins, solo eventos que crearon)
     */
    public function update(Request $request, $id)
    {
        if (!$this->esAdmin()) {
            return $this->respuestaNoAutorizada('Solo los administradores pueden editar eventos.');
        }

        $event = Event::find($id);
        
        if (!$event) {
            return response()->json(['message' => 'Evento no encontrado'], 404);
        }

        if (!$this->esPropietarioEvento($event)) {
            return $this->respuestaNoAutorizada('Solo puedes editar eventos que creaste.');
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'date' => ['sometimes', 'date', 'date_format:Y-m-d'],
            'time' => ['sometimes', 'date_format:H:i'],
            'location' => ['sometimes', 'string', 'max:255'],
            'lat' => ['sometimes', 'nullable', 'numeric'],
            'lng' => ['sometimes', 'nullable', 'numeric'],
            'capacity' => ['sometimes', 'integer', 'min:1'],
            'category' => ['sometimes', 'nullable', 'string', 'max:255'],
            'price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'shareable' => ['sometimes', 'boolean'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        if (isset($validated['time'])) {
            $validated['time'] = $this->normalizarTiempo($validated['time']);
        }

        $event->update($validated);
        $event->refresh();
        $event->loadCount('tickets as attendees_count');

        return response()->json([
            'message' => 'Evento actualizado exitosamente',
            'event' => $this->formatearEvento($event, false)
        ], 200);
    }

    /**
     * Eliminar un evento (solo admins, solo eventos que crearon)
     */
    public function destroy($id)
    {
        if (!$this->esAdmin()) {
            return $this->respuestaNoAutorizada('Solo administradores pueden eliminar eventos.');
        }

        $event = Event::find($id);
        
        if (!$event) {
            return response()->json(['message' => 'Evento no encontrado'], 404);
        }

        if (!$this->esPropietarioEvento($event)) {
            return $this->respuestaNoAutorizada('Solo puedes eliminar eventos que creaste.');
        }

        DB::beginTransaction();
        
        try {
            $ticketCount = Ticket::where('event_id', $id)->count();
            
            // Eliminar todos los tickets del evento
            Ticket::where('event_id', $id)->delete();
            
            // Eliminar el evento
            $event->delete();

            DB::commit();

            return response()->json([
                'message' => 'Evento eliminado exitosamente',
                'tickets_deleted' => $ticketCount
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Error al eliminar el evento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener eventos activos del administrador (solo eventos futuros que creó)
     */
    public function obtenerEventosActivos(Request $request)
    {
        if (!$this->esAdmin()) {
            return $this->respuestaNoAutorizada('No autorizado');
        }

        $sortBy = $request->get('sort_by', 'date');
        $order = $request->get('order', 'asc');
        $perPage = $request->get('per_page', 20);

        $query = Event::where('created_by', Auth::id())
                     ->where('date', '>=', now()->toDateString());

        // Lógica de ordenar
        if ($sortBy === 'attendees') {
            $query->withCount('tickets as tickets_count')
                  ->orderBy('tickets_count', $order);
        } elseif ($sortBy === 'revenue') {
            $query->withSum('tickets', 'price')
                  ->orderBy('tickets_sum_price', $order);
        } else {
            $query->orderBy('date', $order);
        }

        $events = $query->paginate($perPage);

        $events->getCollection()->transform(function ($event) {
            $attendees = $event->tickets()->count();
            $revenue = $event->tickets()->sum('price') ?? 0;
            
            return [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date->format('Y-m-d'),
                'time' => substr($event->time, 0, 5),
                'location' => $event->location,
                'lat' => $event->lat ? (string)$event->lat : null,
                'lng' => $event->lng ? (string)$event->lng : null,
                'capacity' => $event->capacity,
                'attendees' => $attendees,
                'category' => $event->category,
                'price' => (float)$event->price,
                'revenue' => (float)$revenue,
                'shareable' => $event->shareable,
                'image_url' => $event->image_url,
                'created_at' => $event->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'total' => $events->total(),
            'page' => $events->currentPage(),
            'per_page' => $events->perPage(),
            'events' => $events->items()
        ], 200);
    }

    /**
     * Formatear evento para respuesta JSON
     */
    private function formatearEvento(Event $event, bool $incluirCreador = false): array
    {
        $formateado = [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'date' => $event->date->format('Y-m-d'),
            'time' => substr($event->time, 0, 5),
            'location' => $event->location,
            'lat' => $event->lat ? (string)$event->lat : null,
            'lng' => $event->lng ? (string)$event->lng : null,
            'capacity' => $event->capacity,
            'attendees' => $event->attendees_count ?? $event->tickets()->count(),
            'category' => $event->category,
            'price' => (float)$event->price,
            'image_url' => $event->image_url,
            'shareable' => $event->shareable,
            'created_by' => $event->created_by,
        ];

        if ($incluirCreador && $event->relationLoaded('creator')) {
            $formateado['creator'] = $this->formatearCreador($event->creator);
            $formateado['created_at'] = $event->created_at->toIso8601String();
            $formateado['updated_at'] = $event->updated_at->toIso8601String();
        } else {
            $formateado['created_at'] = $event->created_at->toIso8601String();
            if ($event->wasRecentlyCreated || $event->wasChanged()) {
                $formateado['updated_at'] = $event->updated_at->toIso8601String();
            }
        }

        return $formateado;
    }

    /**
     * Formatear información del creador
     */
    private function formatearCreador($creador): ?array
    {
        if (!$creador) {
            return null;
        }

        return [
            'id' => $creador->id,
            'name' => $creador->name,
            'email' => $creador->email,
            'profile_image' => $creador->profile_image
                ? Storage::disk('public')->url('profile_images/' . $creador->profile_image)
                : null,
        ];
    }

    /**
     * Normalizar tiempo de HH:MM a HH:MM:SS
     */
    private function normalizarTiempo(string $tiempo): string
    {
        return strlen($tiempo) === 5 ? $tiempo . ':00' : $tiempo;
    }

    /**
     * Verificar si el usuario actual es admin
     */
    private function esAdmin(): bool
    {
        return Auth::user()?->role === 'admin';
    }

    /**
     * Verificar si el usuario es propietario del evento
     */
    private function esPropietarioEvento(Event $evento): bool
    {
        return $evento->created_by === Auth::id();
    }

    /**
     * Respuesta de no autorizado
     */
    private function respuestaNoAutorizada(string $mensaje)
    {
        return response()->json(['message' => $mensaje], 403);
    }
}
