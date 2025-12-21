
Proyecto front-end (Vite + React + TypeScript)
=============================================

Descripción
-----------
Front construido con Vite, React y TypeScript. Proporciona la interfaz de usuario para la aplicación, consume la API del backend (Laravel) y contiene rutas, componentes y estilos con Tailwind.

Requisitos
---------
- Node.js v18+ y npm o pnpm
- Acceso al backend (por defecto en http://localhost:8000)

Instalación
-----------
1. Instalar dependencias:

```bash
npm install
```

2. Variables de entorno

Crea un archivo `.env` en la carpeta `web` si necesitas configurar variables de Vite. Ejemplo mínimo:

```
VITE_API_URL=http://localhost:8000
```

Comandos útiles
---------------
- Ejecutar en desarrollo (hot-reload):

```bash
npm run dev
```

- Construir para producción:

```bash
npm run build
```

- Construcción en modo desarrollo:

```bash
npm run build:dev
```

- Previsualizar build localmente:

```bash
npm run preview
```

- Ejecutar linter:

```bash
npm run lint
```

Conexión con el backend
-----------------------
Por defecto la app espera la API en la variable `VITE_API_URL` (ej. `http://localhost:8000`). Las llamadas a la API suelen apuntar a `VITE_API_URL + '/api'`. Ajusta la variable en tu `.env` si tu backend corre en otra URL o puerto.

Estructura rápida del proyecto
-----------------------------
- `src/` - código fuente React (componentes, páginas, hooks, etc.)
- `src/assets` - imágenes y recursos estáticos
- `public/` - archivos públicos servidos por Vite
- `index.html` - punto de entrada

Notas y troubleshooting
-----------------------
- Si ves problemas con CORS, habilita CORS en el backend (Laravel `config/cors.php`).
- Si cambias `VITE_API_URL`, reinicia el servidor de desarrollo.
- Para problemas con dependencias, borra `node_modules` y `package-lock.json` y vuelve a ejecutar `npm install`.

Contribuir
----------
Si vas a contribuir, crea una rama con un nombre descriptivo, añade commits claros y abre un PR. Mantén el código en `src/` organizado por páginas y componentes.

Licencia
-------
Revisa la licencia del proyecto raíz. Este README es una guía rápida para desarrollo local.

