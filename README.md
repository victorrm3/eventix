# EVENTIX  
## Plataforma de Gestión de Eventos

EVENTIX es una aplicación web completa para la **gestión de eventos**, orientada a usuarios que desean descubrir eventos, comprar entradas e interactuar socialmente dentro de la plataforma.  
Este proyecto ha sido desarrollado como **Proyecto Final del ciclo DAW**, aplicando una arquitectura moderna y buenas prácticas de desarrollo.

---

##  Funcionalidades

- Gestión y visualización de eventos
- Compra y gestión de entradas
- Sistema de eventos favoritos
- Sistema de amistades entre usuarios
- Grupos de eventos
- Sistema de logros y progreso del usuario
- Autenticación segura mediante tokens

---

## Tecnologías utilizadas

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend
- Laravel 12
- PHP 8.4
- Laravel Sanctum (autenticación por token)

### Base de datos
- MySQL 8.4

### Infraestructura
- Docker
- Laravel Sail (entorno local)
- Contenedores para backend y base de datos (local y producción)

---

## Estructura del proyecto

```bash
PROYECTO FINAL DAW/
├─ backend/                  # API Laravel
│  ├─ app/
│  │  ├─ Http/Controllers/   # Controladores (UserController, GroupController, etc.)
│  │  ├─ Models/             # Modelos Eloquent (User, Event, Ticket, Favorite, Friend...)
│  ├─ database/
│  │  └─ migrations/         # Migraciones de base de datos
│  ├─ config/                # Configuración (cors.php, sanctum.php, etc.)
│  └─ ...
│
└─ web/                      # Frontend React
   ├─ src/
   │  ├─ pages/              # Páginas (Login, Eventos, MiPerfil, Logros, GruposEvento...)
   │  ├─ components/         # Componentes reutilizables (Navegacion, Footer, etc.)
   │  ├─ lib/
   │  │  └─ api.ts           # Cliente API centralizado
   │  └─ contexts/
   │     └─ AuthContext.tsx  # Contexto de autenticación
   └─ ...
