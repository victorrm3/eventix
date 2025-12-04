# Guía para revertir cambios de producción a localhost

Este archivo contiene las instrucciones para revertir los cambios realizados para el despliegue en producción (eventixs.es) y volver a la configuración de localhost.

## Archivos modificados para producción

### Frontend

1. **`web/src/lib/api.ts`**
   - **Producción:** `const API_URL = 'https://eventixs.es/api';`
   - **Localhost:** `const API_URL = 'http://localhost/api';`

2. **`web/src/contexts/AuthContext.tsx`**
   - **Producción:** `const API_URL = 'https://eventixs.es/api';`
   - **Localhost:** `const API_URL = 'http://localhost/api';`

### Backend

3. **`backend/config/cors.php`**
   - **Producción:** Incluye `'https://eventixs.es'` y `'http://eventixs.es'` en `allowed_origins`
   - **Localhost:** Solo incluye `'http://localhost:8080'` y `'http://127.0.0.1:8080'`

4. **`backend/config/sanctum.php`**
   - **Producción:** Incluye `'eventixs.es,www.eventixs.es'` en los stateful domains
   - **Localhost:** Solo incluye `'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1'`

## Pasos para revertir

1. Cambiar `web/src/lib/api.ts`:
   ```typescript
   const API_URL = 'http://localhost/api';
   ```

2. Cambiar `web/src/contexts/AuthContext.tsx`:
   ```typescript
   const API_URL = 'http://localhost/api';
   ```

3. Cambiar `backend/config/cors.php`:
   ```php
   'allowed_origins' => [
       'http://localhost:8080',
       'http://127.0.0.1:8080',
   ],
   ```

4. Cambiar `backend/config/sanctum.php`:
   ```php
   'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
       '%s%s',
       'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
       Sanctum::currentApplicationUrlWithPort(),
   ))),
   ```

5. Limpiar caché de configuración en el backend (si es necesario):
   ```bash
   ./vendor/bin/sail php artisan config:clear
   ```

## Nota

Después de revertir, eliminar este archivo si ya no es necesario.

