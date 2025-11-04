import { Calendar, User, Plus, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navegacion = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              EVENTIX
            </span>
          </Link>

          {/* Links de navegación */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/eventos" className="text-gray-600 hover:text-gray-900 transition-colors">
              Eventos
            </Link>
            <Link to="/saber-mas" className="text-gray-600 hover:text-gray-900 transition-colors">
              Sobre Nosotros
            </Link>
            {user && (
              <Link to="/mi-perfil" className="text-gray-600 hover:text-gray-900 transition-colors">
                Mi Perfil
              </Link>
            )}
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
                {user.role === "admin" && (
                  <button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Crear Evento</span>
                  </button>
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
                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors" onClick={logout} title="Cerrar Sesión">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
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