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

        // Preparar reglas de validación (igual que UserController - verificar archivo primero)
        $rules = [
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
            'shareable' => ['nullable'],
        ];
        
        // Solo añadir regla de imagen si se está enviando un archivo (igual que UserController)
        if ($request->hasFile('image')) {
            $rules['image'] = ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'mimetypes:image/jpeg,image/png,image/jpg,image/gif,image/x-png', 'max:5120'];
        }
        
        // Validar todo de una vez (igual que UserController)
        $validated = $request->validate($rules);
        
        // Convertir tipos después de validar
        if (isset($validated['shareable'])) {
            $shareableValue = $validated['shareable'];
            $validated['shareable'] = in_array($shareableValue, ['1', 'true', 'yes', true, 1], true);
        }
        
        if (isset($validated['capacity']) && is_string($validated['capacity'])) {
            $validated['capacity'] = (int) $validated['capacity'];
        }
        
        if (isset($validated['lat']) && ($validated['lat'] === '0' || $validated['lat'] === '')) {
            $validated['lat'] = null;
        }
        if (isset($validated['lng']) && ($validated['lng'] === '0' || $validated['lng'] === '')) {
            $validated['lng'] = null;
        }
        
        if (isset($validated['price']) && ($validated['price'] === '0' || $validated['price'] === '')) {
            $validated['price'] = null;
        }

        $imageUrl = null;
        
        // Procesar imagen si se envió
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . Auth::id() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('event_images', $imageName, 'public');
            $imageUrl = Storage::disk('public')->url('event_images/' . $imageName);
        }

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
            'image_url' => $imageUrl,
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

        // Preparar reglas de validación
        $rules = [
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
        ];
        
        // Solo añadir regla de imagen si se está enviando un archivo
        if ($request->hasFile('image')) {
            $rules['image'] = ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'mimetypes:image/jpeg,image/png,image/jpg,image/gif,image/x-png', 'max:5120'];
        }
        
        $validated = $request->validate($rules);

        if (isset($validated['time'])) {
            $validated['time'] = $this->normalizarTiempo($validated['time']);
        }

        // Procesar imagen si se envió una nueva
        if ($request->hasFile('image')) {
            // Eliminar imagen anterior si existe
            if ($event->image_url) {
                // Extraer el nombre del archivo de la URL
                $oldImagePath = str_replace(Storage::disk('public')->url(''), '', $event->image_url);
                if ($oldImagePath) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }

            // Guardar nueva imagen
            $image = $request->file('image');
            $imageName = time() . '_' . Auth::id() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('event_images', $imageName, 'public');
            $validated['image_url'] = Storage::disk('public')->url('event_images/' . $imageName);
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
            
            // Eliminar imagen del evento si existe
            if ($event->image_url) {
                $oldImagePath = str_replace(Storage::disk('public')->url(''), '', $event->image_url);
                if ($oldImagePath) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }
            
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
                     ->where('date', '>=', now()->toDateString())
                     ->with('tickets');

        // Lógica de ordenar
        if ($sortBy === 'attendees') {
            $query->withCount('tickets as tickets_count')
                  ->orderBy('tickets_count', $order);
        } elseif ($sortBy === 'revenue') {
            // Para ordenar por revenue, necesitamos cargar los tickets y calcular
            // Por ahora ordenamos por fecha y calculamos después
            $query->orderBy('date', $order);
        } else {
            $query->orderBy('date', $order);
        }

        $events = $query->paginate($perPage);

        $events->getCollection()->transform(function ($event) {
            $tickets = $event->tickets;
            $attendees = $tickets->count();
            
            // Calcular revenue: tickets singulares = event->price, compartidos = event->price * 1.66
            $revenue = 0;
            foreach ($tickets as $ticket) {
                if ($ticket->shared_with !== null) {
                    // Ticket compartido
                    $revenue += $event->price * 1.66;
                } else {
                    // Ticket singular
                    $revenue += $event->price;
                }
            }
            
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
