# Configuración del Backend - Gestión de Eventos

## Endpoints de Gestión de Eventos para Administradores

El panel de administrador requiere los siguientes endpoints para gestionar eventos activos.

---

## 1. Editar Evento

### Endpoint
```
PUT /api/events/{id}
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
  "title": "string",
  "description": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "location": "string",
  "lat": "string (opcional)",
  "lng": "string (opcional)",
  "capacity": 100,
  "category": "string",
  "price": 50.00,
  "shareable": true,
  "image_url": "string (opcional)"
}
```

### Response (200 OK)
```json
{
  "message": "Evento actualizado exitosamente",
  "event": {
    "id": 1,
    "title": "string",
    "description": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "location": "string",
    "lat": "string",
    "lng": "string",
    "capacity": 100,
    "category": "string",
    "price": 50.00,
    "shareable": true,
    "image_url": "string",
    "attendees": 45,
    "updated_at": "2024-11-19T12:30:00Z"
  }
}
```

### Errores Posibles
- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Usuario no es administrador o no creó el evento
- **404 Not Found**: Evento no encontrado
- **422 Unprocessable Entity**: Datos de validación inválidos

---

## 2. Cancelar Evento

### Endpoint
```
DELETE /api/events/{id}
```

### Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "message": "Evento eliminado exitosamente. Reembolsos procesados.",
  "refunds_processed": 45,
  "total_refunded": 2250.00
}
```

### Errores Posibles
- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Usuario no es administrador o no creó el evento
- **404 Not Found**: Evento no encontrado

---

## 3. Obtener Eventos Activos del Administrador

### Endpoint
```
GET /api/admin/events/active
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters (opcionales)
- `sort_by`: `date` | `attendees` | `revenue` (default: `date`)
- `order`: `asc` | `desc` (default: `asc`)
- `page`: número de página (default: 1)
- `per_page`: eventos por página (default: 20)

### Response (200 OK)
```json
{
  "total": 15,
  "page": 1,
  "per_page": 20,
  "events": [
    {
      "id": 1,
      "title": "Festival de Música 2024",
      "description": "string",
      "date": "2024-12-15",
      "time": "19:00",
      "location": "Anfiteatro Central",
      "lat": "40.416775",
      "lng": "-3.703790",
      "capacity": 2000,
      "attendees": 1250,
      "category": "Música",
      "price": 89.00,
      "revenue": 111250.00,
      "shareable": true,
      "image_url": "https://example.com/image.jpg",
      "created_at": "2024-10-01T10:00:00Z"
    }
  ]
}
```

---

## Ejemplo de Implementación en Laravel

### EventController.php

```php
<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    /**
     * Actualizar un evento existente
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

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'date' => 'sometimes|date|after:today',
            'time' => 'sometimes|date_format:H:i',
            'location' => 'sometimes|string|max:255',
            'lat' => 'sometimes|string|max:50',
            'lng' => 'sometimes|string|max:50',
            'capacity' => 'sometimes|integer|min:1',
            'category' => 'sometimes|string|max:100',
            'price' => 'sometimes|numeric|min:0',
            'shareable' => 'sometimes|boolean',
            'image_url' => 'sometimes|string|max:500',
        ]);

        $event->update($validated);

        return response()->json([
            'message' => 'Evento actualizado exitosamente',
            'event' => $event
        ], 200);
    }

    /**
     * Eliminar un evento y procesar reembolsos
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
            $tickets = Ticket::where('event_id', $id)
                           ->where('status', 'validated')
                           ->get();
            
            $totalRefunded = 0;
            $refundsProcessed = 0;

            // Procesar reembolsos para cada ticket
            foreach ($tickets as $ticket) {
                // Aquí integrarías con tu sistema de pagos (Stripe, PayPal, etc.)
                // para procesar el reembolso real
                
                $totalRefunded += $ticket->price;
                $refundsProcessed++;
                
                // Eliminar el ticket
                $ticket->delete();
            }

            // Eliminar el evento de la base de datos
            $event->delete();

            DB::commit();

            return response()->json([
                'message' => 'Evento eliminado exitosamente. Reembolsos procesados.',
                'refunds_processed' => $refundsProcessed,
                'total_refunded' => $totalRefunded
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Error al eliminar el evento',
                'error' => $e->getMessage()
            ], 500);
        }
    }
            return response()->json([
                'message' => 'Error al cancelar el evento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener eventos activos del administrador
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
            $query->withCount('tickets')->orderBy('tickets_count', $order);
        } elseif ($sortBy === 'revenue') {
            $query->withSum('tickets', 'price')->orderBy('tickets_sum_price', $order);
        } else {
            $query->orderBy('date', $order);
        }

        $events = $query->paginate($perPage);

        // Agregar información calculada
        $events->getCollection()->transform(function ($event) {
            $event->attendees = $event->tickets()->count();
            $event->revenue = $event->tickets()->sum('price');
            return $event;
        });

        return response()->json($events, 200);
    }
}
```

### routes/api.php

```php
use App\Http\Controllers\EventController;

Route::middleware('auth:sanctum')->group(function () {
    // Rutas de administrador
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::get('/admin/events/active', [EventController::class, 'getActiveEvents']);
});
```

---

## Notas de Seguridad

1. **Autenticación**: Todos los endpoints requieren autenticación con token Bearer
2. **Autorización**: Solo administradores pueden gestionar eventos
3. **Propiedad**: Los admins solo pueden editar/eliminar eventos que ellos crearon
4. **Validación**: Todos los datos se validan antes de procesar
5. **Transacciones**: Las eliminaciones usan transacciones de base de datos para garantizar consistencia
6. **Reembolsos**: Implementa integración con tu proveedor de pagos real (Stripe, PayPal, etc.)

---

## Testing con cURL

### Editar Evento
```bash
curl -X PUT http://localhost:8000/api/events/1 \
  -H "Authorization: Bearer {tu-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Evento Actualizado",
    "price": 75.00,
    "capacity": 500
  }'
```

### Eliminar Evento
```bash
curl -X DELETE http://localhost:8000/api/events/1 \
  -H "Authorization: Bearer {tu-token}"
```

### Obtener Eventos Activos
```bash
curl -X GET "http://localhost:8000/api/admin/events/active?sort_by=date&order=asc" \
  -H "Authorization: Bearer {tu-token}"
```

---

## Integración con Frontend

El componente `EventosActivos.tsx` ya está configurado para usar estos endpoints. Solo necesitas:

1. Actualizar la URL base en `src/lib/api.ts` con tu backend
2. Implementar los endpoints en Laravel siguiendo esta documentación
3. Configurar CORS correctamente en Laravel
4. Implementar la lógica de reembolsos con tu proveedor de pagos

---

## Próximos Pasos

1. ✅ Implementar endpoints de edición y cancelación
2. ✅ Configurar sistema de reembolsos
3. ⏳ Crear página de edición de eventos (`/admin/editar-evento/{id}`)
4. ⏳ Implementar notificaciones por email a usuarios afectados
5. ⏳ Añadir logs de auditoría para cambios en eventos

