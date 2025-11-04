import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navegacion from "@/components/Navegacion";
import { AlertCircle, Send } from "lucide-react";
import { toast } from "sonner";

const CrearEvento = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: "",
    email: user?.email || "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir si no está autenticado (después de que termine de cargar)
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      
      // Si es admin, redirigir al panel de administrador
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }
    }
  }, [user, isLoading, navigate]);

  // Actualizar email cuando el usuario se cargue
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navegacion />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // No renderizar nada si no hay usuario (se está redirigiendo)
  if (!user) {
    return null;
  }

  // No renderizar nada si es admin (se está redirigiendo)
  if (user.role === "admin") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Aquí irá la petición al backend para enviar la solicitud
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulación

      toast.success("Solicitud enviada correctamente. Nos pondremos en contacto contigo pronto.");
      setFormData({
        organizationName: "",
        email: user?.email || "",
        phone: "",
        message: "",
      });
    } catch (error) {
      toast.error("Error al enviar la solicitud. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navegacion />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Alert informativo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Función de Crear Eventos Deshabilitada
              </h3>
              <p className="text-sm text-blue-700">
                Solo las organizaciones verificadas pueden crear eventos en nuestra plataforma. 
                Si representas a una organización y deseas publicar eventos, completa el siguiente 
                formulario y nuestro equipo revisará tu solicitud.
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Solicitar Acceso de Administrador
            </h1>
            <p className="text-gray-600 mb-8">
              Completa este formulario para solicitar permisos de creación de eventos
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Organización *
                </label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  required
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Asociación Cultural XYZ"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contacto@organizacion.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+34 600 000 000"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Cuéntanos sobre tu organización *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe tu organización, qué tipo de eventos organizas y por qué necesitas acceso de administrador..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? "Enviando..." : "Enviar Solicitud"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearEvento;