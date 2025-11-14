# Backend API - Obtener Eventos

Esta documentación detalla los endpoints GET necesarios para que el frontend pueda mostrar los eventos creados.

## Endpoints Requeridos

### 1. Obtener Todos los Eventos

**Endpoint:** `GET /api/events`

**Descripción:** Retorna la lista de todos los eventos públicos o compartibles.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token} (opcional)
```

**Query Parameters (opcional):**
- `search` (string): Búsqueda por título, descripción o ubicación
- `category` (string): Filtrar por categoría
- `featured` (boolean): Si es "true", retorna solo eventos destacados

**Ejemplo de Request:**
```bash
GET /api/events?search=concierto&featured=true
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "events": [
    {
      "id": 1,
      "title": "Festival de Música de Verano 2024",
      "description": "Únete a nosotros para una noche inolvidable de música en vivo...",
      "date": "2024-07-15",
      "time": "19:00",
      "location": "Anfiteatro del Parque Central",
      "lat": "40.7128",
      "lng": "-74.0060",
      "capacity": 2000,
      "attendees": 1250,
      "category": "Música",
      "price": 89.00,
      "image_url": "https://tu-dominio.com/storage/events/evento1.jpg",
      "shareable": true,
      "created_by": 5,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "title": "Conferencia de Innovación Tecnológica",
      "description": "Descubre las últimas tendencias en tecnología...",
      "date": "2024-08-22",
      "time": "09:00",
      "location": "Centro de Convenciones del Centro",
      "lat": "40.7580",
      "lng": "-73.9855",
      "capacity": 1000,
      "attendees": 845,
      "category": "Tecnología",
      "price": 299.00,
      "image_url": "https://tu-dominio.com/storage/events/evento2.jpg",
      "shareable": true,
      "created_by": 5,
      "created_at": "2024-01-20T14:45:00Z",
      "updated_at": "2024-01-20T14:45:00Z"
    }
  ]
}
```

---

### 2. Obtener Detalle de un Evento

**Endpoint:** `GET /api/events/{id}`

**Descripción:** Retorna la información completa de un evento específico.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token} (opcional)
```

**Path Parameters:**
- `id` (integer): ID del evento

**Ejemplo de Request:**
```bash
GET /api/events/1
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "event": {
    "id": 1,
    "title": "Festival de Música de Verano 2024",
    "description": "Únete a nosotros para una noche inolvidable de música en vivo con los mejores artistas de todo el mundo. Vive actuaciones increíbles bajo las estrellas.",
    "date": "2024-07-15",
    "time": "19:00",
    "location": "Anfiteatro del Parque Central",
    "lat": "40.7128",
    "lng": "-74.0060",
    "capacity": 2000,
    "attendees": 1250,
    "category": "Música",
    "price": 89.00,
    "image_url": "https://tu-dominio.com/storage/events/evento1.jpg",
    "shareable": true,
    "created_by": 5,
    "creator": {
      "id": 5,
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Evento no encontrado"
}
```

---

## Notas de Implementación

### Campos Importantes:

1. **attendees vs capacity**: 
   - `capacity` es el máximo de personas (viene de `maxPersonas` en el frontend)
   - `attendees` es el número actual de personas registradas (viene de `personas` en el frontend)

2. **image_url**:
   - Debe retornar la URL completa del archivo almacenado
   - Ejemplo: `https://tu-dominio.com/storage/events/imagen.jpg`

3. **Funcionalidad de Entrada Compartida (shareable)**:
   - Cuando `shareable = true`, el evento permite comprar "entradas compartidas"
   - Las entradas compartidas son para 2 personas, más caras que una individual pero más baratas que comprar 2 individuales
   - Esto NO afecta a la visibilidad del evento (todos los eventos son públicos)
   - Es una opción comercial para que los asistentes puedan compartir el coste de la entrada

4. **date y time**:
   - `date`: Formato ISO (YYYY-MM-DD) o texto legible según preferencia
   - `time`: Formato 24h (HH:MM)

5. **shareable**:
   - Boolean que indica si las entradas del evento pueden ser compartidas entre 2 usuarios
   - Si es `true`, las entradas pueden comprarse como "entrada compartida" (más cara que una individual pero más barata para dos personas)
   - Todos los eventos son públicos por defecto, este campo solo afecta al tipo de entradas disponibles

6. **lat y lng**:
   - Coordenadas decimales con precisión de al menos 6 decimales
   - Ejemplo: `"40.712800"`, `"-74.006000"`

### Filtrado de Eventos:

- Todos los eventos son públicos y visibles para cualquier usuario
- El campo `shareable` solo afecta al tipo de entradas que se pueden comprar (individual vs compartida)
- Considerar ordenar por fecha del evento (los más próximos primero)

### Búsqueda:

El parámetro `search` debería buscar en:
- `title`
- `description`
- `location`
- `category`

### Eventos Destacados:

Para el parámetro `featured=true`:
- Puedes usar criterios como: eventos más cercanos en fecha, eventos con más asistentes, o un campo adicional `is_featured` en la base de datos
- Retornar máximo 3-6 eventos destacados

### CORS:

Asegurarse de que CORS esté configurado para permitir peticiones desde el frontend.

---

## Ejemplo de Implementación en Laravel

### EventController.php

```php
<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    // GET /api/events
    public function index(Request $request)
    {
        $query = Event::with('creator:id,name,email');
        
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
            $query->orderBy('attendees', 'desc')->limit(6);
        } else {
            $query->orderBy('date', 'asc');
        }
        
        $events = $query->get()->map(function($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'time' => $event->time,
                'location' => $event->location,
                'lat' => $event->lat,
                'lng' => $event->lng,
                'capacity' => $event->capacity,
                'attendees' => $event->attendees,
                'category' => $event->category,
                'price' => $event->price,
                'image_url' => $event->image ? asset('storage/' . $event->image) : null,
                'shareable' => $event->shareable,
                'created_by' => $event->created_by,
                'created_at' => $event->created_at,
                'updated_at' => $event->updated_at,
            ];
        });
        
        return response()->json([
            'success' => true,
            'events' => $events
        ]);
    }
    
    // GET /api/events/{id}
    public function show($id)
    {
        $event = Event::with('creator:id,name,email')->find($id);
        
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
                'date' => $event->date,
                'time' => $event->time,
                'location' => $event->location,
                'lat' => $event->lat,
                'lng' => $event->lng,
                'capacity' => $event->capacity,
                'attendees' => $event->attendees,
                'category' => $event->category,
                'price' => $event->price,
                'image_url' => $event->image ? asset('storage/' . $event->image) : null,
                'shareable' => $event->shareable,
                'created_by' => $event->created_by,
                'creator' => $event->creator,
                'created_at' => $event->created_at,
                'updated_at' => $event->updated_at,
            ]
        ]);
    }
}
```

### routes/api.php

```php
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);
```

---

## Testing

### Test con cURL:

```bash
# Obtener todos los eventos
curl -X GET http://localhost/api/events

# Obtener eventos destacados
curl -X GET "http://localhost/api/events?featured=true"

# Buscar eventos
curl -X GET "http://localhost/api/events?search=música"

# Obtener detalle de evento
curl -X GET http://localhost/api/events/1
```

### Respuestas Esperadas:

- Listado de eventos debe retornar array de eventos
- Cada evento debe incluir todos los campos especificados
- Las URLs de imágenes deben ser accesibles
- La búsqueda debe filtrar correctamente
- Los eventos destacados deben limitarse según lógica implementada