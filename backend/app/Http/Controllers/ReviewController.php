<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Review;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    /**
     * Listar reseñas de un evento
     * GET /api/events/{id}/reviews
     */
    public function index($eventId)
    {
        // Asegurarse de que el evento existe
        $event = Event::find($eventId);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Evento no encontrado',
            ], 404);
        }

        $reviews = Review::with('user')
            ->where('event_id', $eventId)
            ->latest()
            ->get();

        $averageRating = $reviews->avg('rating');

        return response()->json([
            'success' => true,
            'event_id' => $eventId,
            'average_rating' => $averageRating ? round($averageRating, 1) : null,
            'total_reviews' => $reviews->count(),
            'reviews' => $reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'user' => [
                        'id' => $review->user->id,
                        'name' => $review->user->name,
                        'profile_image' => $review->user->profile_image
                            ? Storage::disk('public')->url('profile_images/' . $review->user->profile_image)
                            : null,
                    ],
                    'rating' => (int) $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at->toDateString(),
                ];
            }),
        ]);
    }

    /**
     * Crear o actualizar reseña de un evento para el usuario autenticado
     * POST /api/events/{id}/reviews
     */
    public function store(Request $request, $eventId)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado. Debes estar autenticado.',
            ], 401);
        }

        $event = Event::find($eventId);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Evento no encontrado',
            ], 404);
        }

        // Validar datos de la reseña
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        // Comprobar que el usuario tiene al menos una entrada validada para este evento
        $hasValidatedTicket = Ticket::where('event_id', $eventId)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('shared_with', $user->id);
            })
            ->where('status', 'validated')
            ->exists();

        if (!$hasValidatedTicket) {
            return response()->json([
                'success' => false,
                'message' => 'Solo los asistentes que han validado su entrada pueden dejar una reseña.',
            ], 403);
        }

        // Solo una reseña por usuario y evento: si existe, se actualiza
        $review = Review::updateOrCreate(
            [
                'user_id' => $user->id,
                'event_id' => $eventId,
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Reseña guardada correctamente',
            'review' => [
                'id' => $review->id,
                'user_id' => $review->user_id,
                'event_id' => $review->event_id,
                'rating' => (int) $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at->toIso8601String(),
            ],
        ], 201);
    }
}


