import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navegacion from "@/components/Navegacion";
import { User, Mail, Lock, Image, Users, Ticket, Search, Check, X, UserPlus, Heart, Trash2, Eye } from "lucide-react";
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
  const [usuariosEncontrados, setUsuariosEncontrados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<any[]>([]);

  // Estados para entradas
  const [misEntradas, setMisEntradas] = useState<any[]>([]);

  // Estados para favoritos
  const [favoritos, setFavoritos] = useState<any[]>([]);
  
  // Estados para ver favoritos de amigos
  const [mostrarModalFavoritos, setMostrarModalFavoritos] = useState(false);
  const [favoritosAmigo, setFavoritosAmigo] = useState<any[]>([]);
  const [amigoSeleccionado, setAmigoSeleccionado] = useState<any>(null);
  const [cargandoFavoritosAmigo, setCargandoFavoritosAmigo] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "amistades") {
      cargarAmigos();
      cargarSolicitudes();
    } else if (activeTab === "entradas") {
      cargarEntradas();
    } else if (activeTab === "favoritos") {
      cargarFavoritos();
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

  const cargarSolicitudes = async () => {
    try {
      const data = await peticionApi("/user/friend-requests");
      setSolicitudesPendientes(data.solicitudes || []);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
    }
  };

  const buscarUsuarios = async (email: string) => {
    if (!email || email.length < 3) {
      setUsuariosEncontrados([]);
      return;
    }

    setBuscando(true);
    try {
      const data = await peticionApi(`/user/search?email=${encodeURIComponent(email)}`);
      setUsuariosEncontrados(data.usuarios || []);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      setUsuariosEncontrados([]);
    } finally {
      setBuscando(false);
    }
  };

  const handleEnviarSolicitud = async (receiverId: number) => {
    setLoading(true);
    try {
      await peticionApi("/user/friend-requests", {
        method: "POST",
        body: JSON.stringify({ receiver_id: receiverId }),
      });

      toast.success("Solicitud de amistad enviada");
      // Actualizar el estado del usuario en la lista
      setUsuariosEncontrados((prev) =>
        prev.map((u) =>
          u.id === receiverId ? { ...u, solicitud_pendiente: true } : u
        )
      );
      cargarSolicitudes();
    } catch (error: any) {
      toast.error(error.message || "Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleAceptarSolicitud = async (requestId: number) => {
    setLoading(true);
    try {
      await peticionApi(`/user/friend-requests/${requestId}/accept`, {
        method: "PUT",
      });

      toast.success("Solicitud aceptada");
      cargarSolicitudes();
      cargarAmigos();
    } catch (error: any) {
      toast.error(error.message || "Error al aceptar solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleRechazarSolicitud = async (requestId: number) => {
    setLoading(true);
    try {
      await peticionApi(`/user/friend-requests/${requestId}/reject`, {
        method: "PUT",
      });

      toast.success("Solicitud rechazada");
      cargarSolicitudes();
    } catch (error: any) {
      toast.error(error.message || "Error al rechazar solicitud");
    } finally {
      setLoading(false);
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

  const cargarFavoritos = async () => {
    try {
      const data = await peticionApi("/user/favorites");
      setFavoritos(data.favorites || []);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
    }
  };

  const handleEliminarFavorito = async (eventId: number) => {
    try {
      await peticionApi(`/user/favorites/${eventId}`, {
        method: "DELETE",
      });

      toast.success("Evento eliminado de favoritos");
      cargarFavoritos();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar favorito");
    }
  };

  const handleVerFavoritosAmigo = async (amigo: any) => {
    setAmigoSeleccionado(amigo);
    setMostrarModalFavoritos(true);
    setCargandoFavoritosAmigo(true);
    
    try {
      const data = await peticionApi(`/user/${amigo.id}/favorites`);
      setFavoritosAmigo(data.favorites || []);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar favoritos del amigo");
      setFavoritosAmigo([]);
    } finally {
      setCargandoFavoritosAmigo(false);
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

  const handleValidarEntrada = async (entradaId: number) => {
    try {
      await peticionApi(`/tickets/${entradaId}/validate`, {
        method: "PUT",
      });

      toast.success("Entrada validada correctamente");
      cargarEntradas();
    } catch (error: any) {
      toast.error(error.message || "Error al validar la entrada");
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
              <button
                onClick={() => setActiveTab("favoritos")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "favoritos"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Favoritos
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

                {/* Búsqueda de usuarios */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar Usuario por Email
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={emailAmigo}
                          onChange={(e) => {
                            setEmailAmigo(e.target.value);
                            buscarUsuarios(e.target.value);
                          }}
                          placeholder="correo@ejemplo.com"
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resultados de búsqueda */}
                  {buscando && (
                    <p className="text-sm text-gray-500 text-center py-2">Buscando...</p>
                  )}
                  {!buscando && usuariosEncontrados.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Usuarios encontrados:</h4>
                      {usuariosEncontrados.map((usuario) => (
                        <div
                          key={usuario.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            {usuario.profile_image ? (
                              <img
                                src={usuario.profile_image}
                                alt={usuario.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {usuario.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{usuario.name}</p>
                              <p className="text-sm text-gray-500">{usuario.email}</p>
                            </div>
                          </div>
                          {usuario.es_amigo ? (
                            <span className="text-sm text-green-600 font-medium">Ya es amigo</span>
                          ) : usuario.solicitud_pendiente ? (
                            <span className="text-sm text-yellow-600 font-medium">Solicitud enviada</span>
                          ) : (
                            <button
                              onClick={() => handleEnviarSolicitud(usuario.id)}
                              disabled={loading}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              <UserPlus className="w-4 h-4" />
                              Enviar Solicitud
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Solicitudes pendientes */}
                {solicitudesPendientes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Solicitudes Pendientes</h3>
                    <div className="space-y-2">
                      {solicitudesPendientes.map((solicitud) => (
                        <div
                          key={solicitud.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 bg-yellow-50"
                        >
                          <div className="flex items-center gap-3">
                            {solicitud.sender.profile_image ? (
                              <img
                                src={solicitud.sender.profile_image}
                                alt={solicitud.sender.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {solicitud.sender.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{solicitud.sender.name}</p>
                              <p className="text-sm text-gray-500">{solicitud.sender.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAceptarSolicitud(solicitud.id)}
                              disabled={loading}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Aceptar
                            </button>
                            <button
                              onClick={() => handleRechazarSolicitud(solicitud.id)}
                              disabled={loading}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de amigos */}
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
                          <div className="flex items-center gap-3">
                            {amigo.profile_image ? (
                              <img
                                src={amigo.profile_image}
                                alt={amigo.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {amigo.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{amigo.name}</p>
                              <p className="text-sm text-gray-500">{amigo.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerFavoritosAmigo(amigo)}
                              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Favoritos
                            </button>
                            <button
                              onClick={() => handleEliminarAmigo(amigo.id)}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Eliminar
                            </button>
                          </div>
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
                    Cargando entradas, porfavor espere...
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
                            <div className="flex flex-col gap-2 mt-2">
                              <button className="text-sm text-blue-600 hover:underline">
                                Ver QR
                              </button>
                              <button 
                                onClick={() => handleValidarEntrada(entrada.id)}
                                disabled={entrada.status === 'validated' || entrada.status === 'transferred'}
                                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {entrada.status === 'validated' ? 'Validada' : entrada.status === 'transferred' ? 'Transferida' : 'Validar entrada'}
                              </button>
                              {entrada.status === 'validated' && (
                                <button 
                                  onClick={() => navigate(`/escribir-resena/${entrada.event_id}`)}
                                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                                >
                                  Escribir reseña
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab Favoritos */}
            {activeTab === "favoritos" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Mis Favoritos</h2>

                {favoritos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Aún no tienes eventos en favoritos
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {favoritos.map((favorito) => (
                      <div
                        key={favorito.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {favorito.event ? (
                          <div className="flex gap-4">
                            {favorito.event.image_url && (
                              <img
                                src={favorito.event.image_url}
                                alt={favorito.event.title}
                                className="w-32 h-32 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{favorito.event.title}</h3>
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {favorito.event.description}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                <span>{favorito.event.date}</span>
                                <span>{favorito.event.time}</span>
                                <span>{favorito.event.location}</span>
                                <span className="font-semibold text-blue-600">€{favorito.event.price}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/event/${favorito.event.id}`)}
                                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                >
                                  Ver Detalles
                                </button>
                                <button
                                  onClick={() => handleEliminarFavorito(favorito.event_id)}
                                  className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Quitar de Favoritos
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">Evento no disponible</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Favoritos del Amigo */}
      {mostrarModalFavoritos && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                Eventos Favoritos de {amigoSeleccionado?.name}
              </h2>
              <button
                onClick={() => {
                  setMostrarModalFavoritos(false);
                  setAmigoSeleccionado(null);
                  setFavoritosAmigo([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {cargandoFavoritosAmigo ? (
                <p className="text-gray-500 text-center py-8">Cargando eventos favoritos...</p>
              ) : favoritosAmigo.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {amigoSeleccionado?.name} no tiene eventos en favoritos
                </p>
              ) : (
                <div className="grid gap-4">
                  {favoritosAmigo.map((favorito) => (
                    <div
                      key={favorito.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {favorito.event ? (
                        <div className="flex gap-4">
                          {favorito.event.image_url && (
                            <img
                              src={favorito.event.image_url}
                              alt={favorito.event.title}
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{favorito.event.title}</h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {favorito.event.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                              <span>{favorito.event.date}</span>
                              <span>{favorito.event.time}</span>
                              <span>{favorito.event.location}</span>
                              <span className="font-semibold text-blue-600">€{favorito.event.price}</span>
                            </div>
                            <button
                              onClick={() => {
                                navigate(`/event/${favorito.event.id}`);
                                setMostrarModalFavoritos(false);
                              }}
                              className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                              Ver Detalles
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">Evento no disponible</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiPerfil;