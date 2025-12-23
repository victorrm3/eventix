import { useState } from "react";
import Navegacion from "@/components/Navegacion";
import { Calendar, Mail, Lock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Página de login / registro.
// Comentarios hasta el `return`: estados, validaciones y handlers.
const Login = () => {
  const [barraActiva, setBarraActiva] = useState("login");
  const [infoLogin, setInfoLogin] = useState({
    correo: "",
    contraseña: ""
  });

  // Estado del formulario de registro: nombre, correo, contraseña y confirmación
  const [infoRegistro, setInfoRegistro] = useState({
    name: "",
    correo: "",
    contraseña: "",
    confirmContraseña: ""
  });

  // Acciones del Auth context (login/register)
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // `login` persistirá token/usuario según AuthContext
      await login(infoLogin.correo, infoLogin.contraseña);
      toast.success("Se ha iniciado sesión");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    }
  };

  // Handler de registro: valida contraseñas y llama al contexto de registro
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (infoRegistro.contraseña !== infoRegistro.confirmContraseña) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      // `register` guardará token/usuario si la API devuelve datos de sesión
      await register(infoRegistro.name, infoRegistro.correo, infoRegistro.contraseña);
      toast.success("Registro exitoso");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navegacion />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Cabecera */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Bienvenido a EVENTIX</h1>
            <p className="text-gray-600">Inicia sesión en tu cuenta o crea una nueva</p>
          </div>

          <div className="p-6 bg-white rounded-lg border shadow-sm">
            {/* Barras del login */}
            <div className="grid grid-cols-2 mb-6 bg-gray-100 rounded-lg p-1">
              <button
                className={`py-2 px-4 rounded-md font-medium transition-colors ${
                  barraActiva === "login"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setBarraActiva("login")}
              >
                Iniciar Sesión
              </button>
              <button
                className={`py-2 px-4 rounded-md font-medium transition-colors ${
                  barraActiva === "register"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setBarraActiva("register")}
              >
                Registrarse
              </button>
            </div>
            
            {barraActiva === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="login-email"
                      type="email"
                      placeholder="Introduce tu email"
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={infoLogin.correo}
                      onChange={(e) => setInfoLogin(prev => ({ ...prev, correo: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="login-password"
                      type="password"
                      placeholder="Introduce tu contraseña"
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={infoLogin.contraseña}
                      onChange={(e) => setInfoLogin(prev => ({ ...prev, contraseña: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-600">Recordarme</span>
                  </label>
                  <Link to="#" className="text-purple-600 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-md font-medium transition-all">
                  Iniciar Sesión
                </button>
              </form>
            )}
            
            {barraActiva === "register" && (
              <form onSubmit={handleRegistro} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="register-name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="register-name"
                      type="text"
                      placeholder="Introduce tu nombre completo"
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={infoRegistro.name}
                      onChange={(e) => setInfoRegistro(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="register-email"
                      type="email"
                      placeholder="Introduce tu email"
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={infoRegistro.correo}
                      onChange={(e) => setInfoRegistro(prev => ({ ...prev, correo: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="register-password"
                      type="password"
                      placeholder="Crea una contraseña"
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={infoRegistro.contraseña}
                      onChange={(e) => setInfoRegistro(prev => ({ ...prev, contraseña: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirma tu contraseña"
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={infoRegistro.confirmContraseña}
                      onChange={(e) => setInfoRegistro(prev => ({ ...prev, confirmContraseña: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="rounded" required />
                  <span className="text-gray-600">
                    Acepto los <Link to="#" className="text-purple-600 hover:underline">Términos de Servicio</Link> y la{" "}
                    <Link to="#" className="text-purple-600 hover:underline">Política de Privacidad</Link>
                  </span>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-md font-medium transition-all">
                  Crear Cuenta
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            ¿Necesitas ayuda? <Link to="#" className="text-purple-600 hover:underline">Contactar Soporte</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;