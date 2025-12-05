import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navegacion from "@/components/Navegacion";
import { User, Mail, Lock, Image, Users, Ticket } from "lucide-react";
import { toast } from "sonner";
import { peticionApi } from "@/lib/api";

const MiPerfil = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("perfil");
  const [loading, setLoading] = useState(false);

  // Estados para el perfil
  const [nombre, setNombre] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [imagenPerfil, setImagenPerfil] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState("");

  // Estados para contraseña
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmar, setPasswordConfirmar] = useState("");

  // Estados para amistades
  const [amigos, setAmigos] = useState<any[]>([]);
  const [emailAmigo, setEmailAmigo] = useState("");

  // Estados para entradas
  const [misEntradas, setMisEntradas] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "amistades") {
      cargarAmigos();
    } else if (activeTab === "entradas") {
      cargarEntradas();
    }
  }, [activeTab]);

  const cargarAmigos = async () => {
    try {
      const data = await peticionApi("/user/friends");
      setAmigos(data.friends || []);
    } catch (error) {
      console.error("Error al cargar amigos:", error);
    }
  };

  const cargarEntradas = async () => {
    try {
      const data = await peticionApi("/user/tickets");
      setMisEntradas(data.tickets || []);
    } catch (error) {
      console.error("Error al cargar entradas:", error);
    }
  };

  const handleActualizarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await peticionApi("/user/profile", {
        method: "PUT",
        body: JSON.stringify({ name: nombre, email }),
      });

      if (data.user) {
        updateUser(data.user);
      } else {
        updateUser({ name: nombre, email });
      }
      toast.success("Perfil actualizado correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarImagen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagenPerfil) {
      toast.error("Por favor selecciona una imagen");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("profile_image", imagenPerfil);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://eventixs.es/api'}/user/profile-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Error al actualizar la imagen" }));
        const errorMessage = error.message || (error.errors ? JSON.stringify(error.errors) : "Error al actualizar la imagen");
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.user) {
        updateUser(data.user);
      } else if (data.image_url) {
        // Fallback: si solo viene image_url, actualizar solo eso
        updateUser({ profile_image: data.image_url });
      }

      toast.success("Imagen actualizada correctamente");
      setImagenPerfil(null);
      setPreviewImagen("");
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la imagen");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordNueva !== passwordConfirmar) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await peticionApi("/user/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: passwordActual,
          new_password: passwordNueva,
        }),
      });

      toast.success("Contraseña actualizada correctamente");
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirmar("");
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarAmigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await peticionApi("/user/friends", {
        method: "POST",
        body: JSON.stringify({ email: emailAmigo }),
      });

      toast.success("Solicitud de amistad enviada");
      setEmailAmigo("");
      cargarAmigos();
    } catch (error: any) {
      toast.error(error.message || "Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarAmigo = async (amigoId: number) => {
    try {
      await peticionApi(`/user/friends/${amigoId}`, {
        method: "DELETE",
      });

      toast.success("Amistad eliminada");
      cargarAmigos();
    } catch (error: any) {
      toast.error("Error al eliminar amistad");
    }
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenPerfil(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagen(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Navegacion />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mi Perfil
          </h1>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b overflow-x-auto">
              <button
                onClick={() => setActiveTab("perfil")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "perfil"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Perfil
              </button>
              <button
                onClick={() => setActiveTab("imagen")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "imagen"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Image className="w-4 h-4 inline mr-2" />
                Foto
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "password"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Contraseña
              </button>
              <button
                onClick={() => setActiveTab("amistades")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "amistades"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Amistades
              </button>
              <button
                onClick={() => setActiveTab("entradas")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "entradas"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Ticket className="w-4 h-4 inline mr-2" />
                Mis Entradas
              </button>
            </div>
          </div>

          {/* Contenido de tabs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Tab Perfil */}
            {activeTab === "perfil" && (
              <form onSubmit={handleActualizarPerfil} className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Información Personal</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </form>
            )}

            {/* Tab Imagen */}
            {activeTab === "imagen" && (
              <form onSubmit={handleCambiarImagen} className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Foto de Perfil</h2>

                <div className="flex flex-col items-center space-y-4">
                  {previewImagen ? (
                    <img
                      src={previewImagen}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagenChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !imagenPerfil}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Subiendo..." : "Cambiar Foto"}
                </button>
              </form>
            )}

            {/* Tab Contraseña */}
            {activeTab === "password" && (
              <form onSubmit={handleCambiarPassword} className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Cambiar Contraseña</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordConfirmar}
                    onChange={(e) => setPasswordConfirmar(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Actualizando..." : "Cambiar Contraseña"}
                </button>
              </form>
            )}

            {/* Tab Amistades */}
            {activeTab === "amistades" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Gestionar Amistades</h2>

                <form onSubmit={handleAgregarAmigo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agregar Amigo por Email
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailAmigo}
                        onChange={(e) => setEmailAmigo(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </form>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Mis Amigos</h3>
                  {amigos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Aún no tienes amigos agregados
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {amigos.map((amigo) => (
                        <div
                          key={amigo.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{amigo.name}</p>
                            <p className="text-sm text-gray-500">{amigo.email}</p>
                          </div>
                          <button
                            onClick={() => handleEliminarAmigo(amigo.id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab Entradas */}
            {activeTab === "entradas" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Mis Entradas</h2>

                {misEntradas.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No tienes entradas compradas
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {misEntradas.map((entrada) => (
                      <div
                        key={entrada.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{entrada.event_title}</h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {entrada.event_date} • {entrada.event_location}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Estado: <span className="font-medium">{entrada.status}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">${entrada.price}</p>
                            <button className="text-sm text-blue-600 hover:underline mt-2">
                              Ver QR
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;