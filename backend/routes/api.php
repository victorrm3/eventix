<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\ReviewController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Eventos
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);
Route::get('/events/{id}/reviews', [ReviewController::class, 'index']);

// Responder CORS de cualquier ruta API
Route::options('/{any}', function () {
    return response()->noContent();
})->where('any', '.*');

// Rutas protegidas con autenticación Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Perfil de usuario
    Route::put('/user/profile', [UserController::class, 'actualizarPerfil']);
    Route::post('/user/profile-image', [UserController::class, 'actualizarImagenPerfil']);
    Route::put('/user/password', [UserController::class, 'cambiarContrasena']);
    
    // Amigos
    Route::get('/user/friends', [UserController::class, 'obtenerAmigos']);
    Route::post('/user/friends', [UserController::class, 'agregarAmigo']);
    Route::delete('/user/friends/{id}', [UserController::class, 'eliminarAmigo']);
    
    // Solicitudes de amistad
    Route::get('/user/search', [UserController::class, 'buscarUsuarios']);
    Route::post('/user/friend-requests', [UserController::class, 'enviarSolicitud']);
    Route::get('/user/friend-requests', [UserController::class, 'obtenerSolicitudes']);
    Route::get('/user/friend-requests/count', [UserController::class, 'obtenerContadorSolicitudes']);
    Route::put('/user/friend-requests/{id}/accept', [UserController::class, 'aceptarSolicitud']);
    Route::put('/user/friend-requests/{id}/reject', [UserController::class, 'rechazarSolicitud']);
    
    // Entradas
    Route::get('/user/tickets', [UserController::class, 'obtenerEntradas']);
    Route::post('/tickets/purchase', [TicketController::class, 'purchase']);
    Route::put('/tickets/{id}/validate', [TicketController::class, 'validate']);

    // Favoritos
    Route::get('/user/favorites', [UserController::class, 'obtenerFavoritos']);
    Route::post('/user/favorites', [UserController::class, 'agregarFavorito']);
    Route::delete('/user/favorites/{eventId}', [UserController::class, 'eliminarFavorito']);
    Route::get('/user/favorites/{eventId}/check', [UserController::class, 'verificarFavorito']);
    Route::get('/user/{userId}/favorites', [UserController::class, 'obtenerFavoritosUsuario']);
    
    // Logros
    Route::get('/user/achievements', [UserController::class, 'obtenerLogros']);

    // Reseñas
    Route::post('/events/{id}/reviews', [ReviewController::class, 'store']);
    
    // Eventos (solo admins)
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::post('/events/{id}/update-with-image', [EventController::class, 'updateWithImage']); // Ruta POST para actualizar con imagen
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::get('/admin/events/active', [EventController::class, 'obtenerEventosActivos']);
});