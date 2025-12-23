import { User, Plus, LogOut, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { peticionApi } from "@/lib/api";
import logoEventix from "@/assets/logo-eventix.png";

// Barra de navegación principal de la aplicación.
// - Muestra el logo y enlaces públicos.
// - Si hay `user`, muestra opciones adicionales (perfil, logros, crear evento, etc.).
// - Hace una actualización de notificaciones de solicitudes de amistad cada 30s cuando el usuario está logueado.
const Navegacion = () => {
  const { user, logout } = useAuth();
  const [notificacionesCount, setNotificacionesCount] = useState(0);

  // Efecto que inicia la actualización de notificaciones cuando hay un usuario activo.
  useEffect(() => {
    if (user) {
      cargarNotificaciones();
      // Actualizar cada 30 segundos
      const interval = setInterval(cargarNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Petición al backend para obtener el número de solicitudes pendientes.
  // `peticionApi` centraliza base URL y headers, por eso sólo pasamos la ruta.
  const cargarNotificaciones = async () => {
    try {
      const data = await peticionApi("/user/friend-requests/count");
      setNotificacionesCount(data.count || 0);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo: enlace a home */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoEventix} 
              alt="EVENTIX" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Links de navegación */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/eventos" className="text-gray-600 hover:text-gray-900 transition-colors">
              Eventos
            </Link>
            <Link to="/saber-mas" className="text-gray-600 hover:text-gray-900 transition-colors">
              Sobre Nosotros
            </Link>

            {/* Opciones visibles sólo si el usuario está autenticado */}
            {user && (
              <>
                <Link to="/mi-perfil" className="text-gray-600 hover:text-gray-900 transition-colors relative inline-block">
                  Mi Perfil
                  {notificacionesCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {notificacionesCount > 9 ? '9+' : notificacionesCount}
                    </span>
                  )}
                </Link>
                <Link to="/logros" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  Logros
                  </Link>
                <Link to="/tus-grupos" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Tus Grupos
                </Link>
              </>
            )}

            {/* Enlaces condicionales según el rol del usuario */}
            {user?.role === "user" && (
              <Link to="/crear-evento" className="text-gray-600 hover:text-gray-900 transition-colors">
                Crear Evento
              </Link>
            )}
            {user?.role === "admin" && (
              <Link to="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
                Administrador
              </Link>
            )}
          </div>

          {/* Botones */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Botón para crear evento accesible a admins */}
                {user.role === "admin" && (
                  <Link to="/admin/crear-evento">
                    <button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Crear Evento</span>
                    </button>
                  </Link>
                )}
                <div className="hidden md:flex items-center space-x-3">
                  {user.profile_image ? (
                    <img 
                      src={user.profile_image} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center border-2 border-gray-200">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Bienvenido,</span>
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  </div>
                </div>

                {/* Logout */}
                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors" onClick={logout} title="Cerrar Sesión">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              // Si no hay usuario, mostrar botón de login
              <Link to="/login">
                <button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors">
                  <User className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navegacion;