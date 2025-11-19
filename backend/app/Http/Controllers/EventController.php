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

        $events = $query->get()->map(function($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date->format('Y-m-d'),
                'time' => substr($event->time, 0, 5), // Solo HH:MM
                'location' => $event->location,
                'lat' => $event->lat ? (string)$event->lat : null,
                'lng' => $event->lng ? (string)$event->lng : null,
                'capacity' => $event->capacity,
                'attendees' => $event->attendees_count ?? 0,
                'category' => $event->category,
                'price' => (float)$event->price,
                'image_url' => $event->image_url,
                'shareable' => $event->shareable,
                'created_by' => $event->created_by,
                'creator' => $event->creator ? [
                    'id' => $event->creator->id,
                    'name' => $event->creator->name,
                    'email' => $event->creator->email,
                    'profile_image' => $event->creator->profile_image
                        ? Storage::disk('public')->url('profile_images/' . $event->creator->profile_image)
                        : null,
                ] : null,
                /*created_at y updated_at no están en el diagrama de la base de datos, porque eran columnas que me pedía
                Laravel Sanctum para tener la interacción del Front con el Back*/
                'created_at' => $event->created_at->toIso8601String(),
                'updated_at' => $event->updated_at->toIso8601String(),
            ];
        });

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
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date->format('Y-m-d'),
                'time' => substr($event->time, 0, 5), // Solo HH:MM
                'location' => $event->location,
                'lat' => $event->lat ? (string)$event->lat : null,
                'lng' => $event->lng ? (string)$event->lng : null,
                'capacity' => $event->capacity,
                'attendees' => $event->attendees_count ?? 0,
                'category' => $event->category,
                'price' => (float)$event->price,
                'image_url' => $event->image_url,
                'shareable' => $event->shareable,
                'created_by' => $event->created_by,
                'creator' => [
                    'id' => $event->creator->id,
                    'name' => $event->creator->name,
                    'email' => $event->creator->email,
                    'profile_image' => $event->creator->profile_image
                        ? \Illuminate\Support\Facades\Storage::disk('public')->url('profile_images/' . $event->creator->profile_image)
                        : null,
                ],
                'created_at' => $event->created_at->toIso8601String(),
                'updated_at' => $event->updated_at->toIso8601String(),
            ]
        ]);
    }

    /**
     * Crear un nuevo evento (solo admins)
     */
    public function store(Request $request)
    {
        // Verificar que el usuario sea admin
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'No tienes permisos para crear eventos'
            ], 403);
        }

        // Validar los datos
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
            'shareable' => ['nullable', 'string', 'in:0,1'],
            'image' => ['nullable', 'image', 'max:2048'], // Máximo 2MB
        ]);

        // Manejar la imagen
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('events', $imageName, 'public');
            $imageUrl = Storage::disk('public')->url($imagePath);
        }

        // Convertir tiempo de HH:MM a HH:MM:SS si es necesario
        $time = $validated['time'];
        if (strlen($time) === 5) { // Formato HH:MM
            $time .= ':00'; // Convertir a HH:MM:SS
        }

        // Crear el evento
        $event = Event::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'date' => $validated['date'],
            'time' => $time,
            'location' => $validated['location'],
            'lat' => $validated['lat'] ?? null,
            'lng' => $validated['lng'] ?? null,
            'capacity' => $validated['capacity'],
            'category' => $validated['category'] ?? null,
            'price' => $validated['price'] ?? 0,
            'shareable' => isset($validated['shareable']) ? (bool)$validated['shareable'] : false,
            'image_url' => $imageUrl,
            'created_by' => $user->id,
        ]);

        // Recargar el evento con el conteo de tickets
        $event->loadCount('tickets as attendees_count');

        return response()->json([
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'date' => $event->date->format('Y-m-d'),
            'time' => substr($event->time, 0, 5), // Solo HH:MM
            'location' => $event->location,
            'lat' => $event->lat ? (string)$event->lat : null,
            'lng' => $event->lng ? (string)$event->lng : null,
            'capacity' => $event->capacity,
            'attendees' => $event->attendees_count ?? 0,
            'category' => $event->category,
            'price' => (float)$event->price,
            'shareable' => $event->shareable ? 1 : 0,
            'image_url' => $event->image_url,
            'created_by' => $event->created_by,
            'created_at' => $event->created_at->toIso8601String(),
        ], 201);
    }

    /**
     * Actualizar un evento existente (solo admins, solo eventos que crearon)
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        // Verificar que el usuario es admin
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'No autorizado. Solo administradores pueden editar eventos.'
            ], 403);
        }

        $event = Event::find($id);
        
        if (!$event) {
            return response()->json([
                'message' => 'Evento no encontrado'
            ], 404);
        }

        // Verificar que el admin creó este evento
        if ($event->created_by !== $user->id) {
            return response()->json([
                'message' => 'No autorizado. Solo puedes editar eventos que creaste.'
            ], 403);
        }

        // Validar los datos (todos opcionales con 'sometimes')
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

        // Convertir tiempo de HH:MM a HH:MM:SS si es necesario
        if (isset($validated['time']) && strlen($validated['time']) === 5) {
            $validated['time'] .= ':00';
        }

        // Actualizar el evento
        $event->update($validated);

        // Recargar con conteo de tickets
        $event->loadCount('tickets as attendees_count');

        return response()->json([
            'message' => 'Evento actualizado exitosamente',
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date->format('Y-m-d'),
                'time' => substr($event->time, 0, 5), // Solo HH:MM
                'location' => $event->location,
                'lat' => $event->lat ? (string)$event->lat : null,
                'lng' => $event->lng ? (string)$event->lng : null,
                'capacity' => $event->capacity,
                'category' => $event->category,
                'price' => (float)$event->price,
                'shareable' => $event->shareable,
                'image_url' => $event->image_url,
                'attendees' => $event->attendees_count ?? 0,
                'updated_at' => $event->updated_at->toIso8601String(),
            ]
        ], 200);
    }

    /**
     * Eliminar un evento y procesar reembolsos (solo admins, solo eventos que crearon)
     */
    public function destroy($id)
    {
        $user = Auth::user();
        
        // Verificar que el usuario es admin
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'No autorizado. Solo administradores pueden eliminar eventos.'
            ], 403);
        }

        $event = Event::find($id);
        
        if (!$event) {
            return response()->json([
                'message' => 'Evento no encontrado'
            ], 404);
        }

        // Verificar que el admin creó este evento
        if ($event->created_by !== $user->id) {
            return response()->json([
                'message' => 'No autorizado. Solo puedes eliminar eventos que creaste.'
            ], 403);
        }

        DB::beginTransaction();
        
        try {
            // Obtener todos los tickets del evento
            $tickets = Ticket::where('event_id', $id)->get();
            
            $totalRefunded = 0;
            $refundsProcessed = 0;
            $ticketPrice = 0;
            $ticketCount = $tickets->count();

            // Calcular reembolsos (mock para pruebas)
            foreach ($tickets as $ticket) {
                $ticketPrice = $ticket->price ?? $event->price ?? 0;
                $totalRefunded += $ticketPrice;
                $refundsProcessed++;
            }

            // Si no hay tickets pero hay precio del evento, usar el precio del evento
            if ($ticketCount === 0 && $event->price > 0) {
                $ticketPrice = $event->price;
            }

            // Crear directorio de reembolsos si no existe
            $refundsPath = storage_path('app/refunds');
            if (!file_exists($refundsPath)) {
                mkdir($refundsPath, 0755, true);
            }

            // Crear archivo .txt con información de reembolsos (mock)
            $filename = 'refund_event_' . $id . '_' . date('Y-m-d_His') . '.txt';
            $filepath = $refundsPath . '/' . $filename;
            
            $content = "REEMBOLSOS DE EVENTO (MOCK - SOLO PARA PRUEBAS)\n";
            $content .= "================================================\n\n";
            $content .= "Evento ID: " . $event->id . "\n";
            $content .= "Título: " . $event->title . "\n";
            $content .= "Fecha: " . $event->date->format('Y-m-d') . "\n";
            $content .= "Eliminado por: " . $user->name . " (ID: " . $user->id . ")\n";
            $content .= "Fecha de eliminación: " . now()->format('Y-m-d H:i:s') . "\n\n";
            $content .= "INFORMACIÓN DE TICKETS:\n";
            $content .= "-----------------------\n";
            $content .= "Total de tickets relacionados con el evento: " . $ticketCount . "\n";
            $content .= "Precio por ticket: €" . number_format((float)$ticketPrice, 2, ',', '.') . "\n\n";
            $content .= "CÁLCULO DE REEMBOLSOS:\n";
            $content .= "----------------------\n";
            $content .= "Número de tickets × Precio por ticket\n";
            $content .= $ticketCount . " × €" . number_format((float)$ticketPrice, 2, ',', '.') . "\n";
            $content .= "= €" . number_format((float)$totalRefunded, 2, ',', '.') . "\n\n";
            $content .= "NOTA: Este es un archivo de prueba. No se han procesado reembolsos reales.\n";
            
            file_put_contents($filepath, $content);

            // Eliminar todos los tickets del evento
            Ticket::where('event_id', $id)->delete();

            // Eliminar el evento de la base de datos
            $event->delete();

            DB::commit();

            return response()->json([
                'message' => 'Evento eliminado exitosamente. Reembolsos procesados.',
                'refunds_processed' => $refundsProcessed,
                'total_refunded' => number_format((float)$totalRefunded, 2, '.', '')
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
    public function getActiveEvents(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $sortBy = $request->get('sort_by', 'date');
        $order = $request->get('order', 'asc');
        $perPage = $request->get('per_page', 20);

        $query = Event::where('created_by', $user->id)
                     ->where('date', '>=', now()->toDateString());

        // Agregar ordenamiento
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

        // Agregar información calculada
        $events->getCollection()->transform(function ($event) {
            $attendees = $event->tickets()->count();
            $revenue = $event->tickets()->sum('price') ?? 0;
            
            return [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date->format('Y-m-d'),
                'time' => substr($event->time, 0, 5), // Solo HH:MM
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
}
