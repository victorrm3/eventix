<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EventController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Eventos (públicos, solo eventos shareable)
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Responder CORS de cualquier ruta API
Route::options('/{any}', function () {
    return response()->noContent();
})->where('any', '.*');

// Rutas protegidas con autenticación Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Perfil de usuario
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/profile-image', [UserController::class, 'updateProfileImage']);
    Route::put('/user/password', [UserController::class, 'changePassword']);
    
    // Amigos
    Route::get('/user/friends', [UserController::class, 'getFriends']);
    Route::post('/user/friends', [UserController::class, 'addFriend']);
    Route::delete('/user/friends/{id}', [UserController::class, 'removeFriend']);
    
    // Entradas
    Route::get('/user/tickets', [UserController::class, 'getTickets']);
    
    // Eventos (solo admins)
    Route::post('/events', [EventController::class, 'store']);
});