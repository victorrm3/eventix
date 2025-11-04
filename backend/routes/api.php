<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Responder los preflight CORS de cualquier ruta API
Route::options('/{any}', function () {
    return response()->noContent();
})->where('any', '.*');