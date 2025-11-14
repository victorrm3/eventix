<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
}
