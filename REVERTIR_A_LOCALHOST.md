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

## Notas

- Si en algún momento quieres volver a trabajar en local, invierte estos cambios (poner de nuevo `http://localhost/api`, quitar dominios de producción en CORS y Sanctum).
- Mantén este archivo actualizado si cambian dominios o rutas en el futuro.
