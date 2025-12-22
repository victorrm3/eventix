# Guía para pasar de localhost a producción

Este archivo contiene las instrucciones para aplicar los cambios necesarios cuando quieras desplegar el proyecto en producción (`eventixs.es`), partiendo de la configuración de desarrollo en `localhost`.

## Archivos a modificar para producción

### Frontend

1. **`web/src/lib/api.ts`**
   - **Localhost (desarrollo):** `const API_URL = 'http://localhost/api';`
   - **Producción:** `const API_URL = 'https://eventixs.es/api';`

2. **`web/src/contexts/AuthContext.tsx`**
   - **Localhost (desarrollo):** `const API_URL = 'http://localhost/api';`
   - **Producción:** `const API_URL = 'https://eventixs.es/api';`

### Backend

3. **`backend/config/cors.php`**
   - **Localhost (desarrollo):** Solo incluye `'http://localhost:8080'` y `'http://127.0.0.1:8080'` en `allowed_origins`.
   - **Producción:** Debe añadir `'https://eventixs.es'` y opcionalmente `'http://eventixs.es'` a `allowed_origins`.

4. **`backend/config/sanctum.php`**
   - **Localhost (desarrollo):** Solo incluye `'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1'` en los stateful domains por defecto.
   - **Producción:** Añadir `'eventixs.es,www.eventixs.es'` a la lista de dominios stateful.

## Pasos para ir de localhost a producción

1. Cambiar `web/src/lib/api.ts` a producción:
   ```typescript
   const API_URL = 'https://eventixs.es/api';
   ```

2. Cambiar `web/src/contexts/AuthContext.tsx` a producción:
   ```typescript
   const API_URL = 'https://eventixs.es/api';
   ```

3. Cambiar `backend/config/cors.php` para permitir el dominio de producción:
   ```php
   'allowed_origins' => [
       'http://localhost:8080',
       'http://127.0.0.1:8080',
       'https://eventixs.es',
       'http://eventixs.es',
   ],
   ```

4. Cambiar `backend/config/sanctum.php` para añadir los dominios de producción:
   ```php
   'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
       '%s%s',
       'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1,eventixs.es,www.eventixs.es',
       Sanctum::currentApplicationUrlWithPort(),
   ))),
   ```

5. Limpiar caché de configuración en el backend (recomendado al cambiar de entorno):
   ```bash
   ./vendor/bin/sail php artisan config:clear
   ```

6. Aplicar migraciones nuevas en producción (desde que se creó el proyecto inicial):

   Ejecutar en el servidor de producción (dentro del contenedor de Laravel si usas Sail/Docker):

   ```bash
   # Solo migraciones pendientes
   php artisan migrate

   # O, si quieres forzar una migración concreta:
   php artisan migrate --path=database/migrations/2025_12_01_000000_create_friend_requests_table.php
   php artisan migrate --path=database/migrations/2025_12_21_000000_add_invite_code_to_event_groups_table.php
   ```

   Migraciones nuevas relevantes:

   - `2025_12_01_000000_create_friend_requests_table.php`
     - Crea la tabla `friend_requests` para el sistema de solicitudes de amistad.
     - Columnas principales:
       - `sender_id` (FK a `users.id`)
       - `receiver_id` (FK a `users.id`)
       - `status` (`pending`, `accepted`, `rejected`)
   - `2025_12_21_000000_add_invite_code_to_event_groups_table.php`
     - Añade la columna `invite_code` a `event_groups` para gestionar enlaces de invitación a grupos privados.

   Asegúrate de que en producción se han ejecutado TODAS las migraciones del proyecto y, en especial, estas dos si vienes de una versión anterior sin amigos/grupos.

7. Verificar rutas API nuevas utilizadas por el frontend

   No es necesario tocar archivos de configuración para las rutas, pero de cara al despliegue conviene conocer los nuevos endpoints que deben funcionar en producción:

   - **Sistema de amistad**
     - `GET  /api/user/search`
     - `POST /api/user/friend-requests`
     - `GET  /api/user/friend-requests`
     - `GET  /api/user/friend-requests/count`
     - `PUT  /api/user/friend-requests/{id}/accept`
     - `PUT  /api/user/friend-requests/{id}/reject`
     - `GET  /api/user/friends`
     - `POST /api/user/friends`
     - `DELETE /api/user/friends/{id}`

   - **Favoritos de eventos**
     - `GET  /api/user/favorites`
     - `POST /api/user/favorites`
     - `DELETE /api/user/favorites/{eventId}`
     - `GET  /api/user/favorites/{eventId}/check`
     - `GET  /api/user/{userId}/favorites`

   - **Logros**
     - `GET  /api/user/achievements`

   - **Grupos de eventos**
     - `GET    /api/events/{eventId}/groups`   (listar grupos públicos de un evento)
     - `POST   /api/groups`                    (crear grupo)
     - `GET    /api/groups/{groupId}`          (detalles + miembros)
     - `POST   /api/groups/{groupId}/join`     (unirse a grupo público)
     - `POST   /api/groups/join-by-invite`     (unirse a grupo privado por código)
     - `DELETE /api/groups/{groupId}/leave`    (salir de un grupo)
     - `GET    /api/user/groups`              (grupos a los que pertenece el usuario)

   Si el código desplegado en producción incluye estos controladores y rutas (commit actualizado), no hace falta configuración extra: basta con que el servidor web (Nginx/Apache) esté apuntando a `public/index.php` como hasta ahora.

## Notas

- Si en algún momento quieres volver a trabajar en local, invierte estos cambios (poner de nuevo `http://localhost/api`, quitar dominios de producción en CORS y Sanctum).
- Mantén este archivo actualizado si cambian dominios o rutas en el futuro.
