# Configuración del Backend Laravel

## Estructura Preparada

Se ha eliminado el login mock y ahora la aplicación está lista para conectarse a tu backend Laravel.

## Endpoints del Backend Necesarios

Tu backend Laravel debe implementar los siguientes endpoints:

### 1. POST `/api/register`
```json
// Request
{
  "name": "string",
  "email": "string",
  "password": "string"
}

// Response (201 Created)
{
  "token": "string",
  "user": {
    "id": 1,
    "name": "string",
    "email": "string",
    "role": "admin" | "user"
  }
}
```

### 2. POST `/api/login`
```json
// Request
{
  "email": "string",
  "password": "string"
}

// Response (200 OK)
{
  "token": "string",
  "user": {
    "id": 1,
    "name": "string",
    "email": "string",
    "role": "admin" | "user"
  }
}
```

## Configuración de la URL del Backend

**Archivo:** `src/contexts/AuthContext.tsx`
**Línea 18:** Actualiza la URL con tu backend Laravel
```typescript
const API_URL = 'http://localhost:8000/api'; // Cambiar por tu URL
```

También en **`src/lib/api.ts`** línea 2:
```typescript
const API_URL = 'http://localhost:8000/api'; // Cambiar por tu URL
```

## Ejemplo de Implementación en Laravel

### AuthController.php
```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user', // Por defecto
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json([
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }
}
```

### routes/api.php
```php
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
```

## Configuración de CORS en Laravel

Asegúrate de configurar CORS en Laravel para permitir las peticiones desde tu frontend:

**Archivo:** `config/cors.php`
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173', 'tu-dominio.com'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

## Autenticación con Sanctum

Instala Laravel Sanctum si no lo tienes:
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

Añade Sanctum al modelo User:
```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    // ...
}
```

## Funcionalidades Implementadas en el Frontend

- ✅ Context API para manejo de autenticación
- ✅ LocalStorage para persistencia de sesión
- ✅ Sistema de notificaciones con toast
- ✅ Redirección automática después de login/registro
- ✅ Validación de contraseñas coincidentes en registro
- ✅ Navegación condicional según rol de usuario
- ✅ Protección del botón "Crear Evento" para admins

## Próximos Pasos

1. Actualiza las URLs del API en los archivos mencionados
2. Implementa los endpoints en tu backend Laravel
3. Configura CORS correctamente
4. Prueba el login y registro
5. (Opcional) Añade middleware de autenticación para rutas protegidas
