import Navegacion from "@/components/Navegacion";
import { Users, Plus, Lock, Globe, Link, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { peticionApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Grupo {
  id: number;
  nombre: string;
  lugarQuedada: string;
  visibilidad: "publica" | "privada";
  miembros: number;
  esMiembro: boolean;
  enlace?: string | null;
  inviteUrl?: string | null;
}

const GruposEvento = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEnlacePrivado, setMostrarEnlacePrivado] = useState(false);
  const [enlacePrivado, setEnlacePrivado] = useState("");
  const [unirseCargando, setUnirseCargando] = useState<number | null>(null);
  
  const [nuevoGrupo, setNuevoGrupo] = useState({
    nombre: "",
    lugarQuedada: "",
    visibilidad: "publica" as "publica" | "privada"
  });

  useEffect(() => {
    if (eventId) {
      cargarGrupos();
      
      // Verificar si hay un código de invitación en la URL
      const urlParams = new URLSearchParams(window.location.search);
      const inviteCode = urlParams.get('invite');
      if (inviteCode && user) {
        setEnlacePrivado(inviteCode);
        setMostrarEnlacePrivado(true);
      }
    }
  }, [eventId, user]);

  const cargarGrupos = async () => {
    try {
      setCargando(true);
      const data = await peticionApi(`/events/${eventId}/groups`);
      setGrupos(data.groups || []);
    } catch (error: any) {
      console.error("Error al cargar grupos:", error);
      toast.error(error.message || "Error al cargar los grupos");
    } finally {
      setCargando(false);
    }
  };

  const gruposPublicos = grupos.filter(g => g.visibilidad === "publica");

  const handleCrearGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Debes iniciar sesión para crear un grupo");
      return;
    }

    if (!nuevoGrupo.nombre.trim() || !nuevoGrupo.lugarQuedada.trim()) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    try {
      const data = await peticionApi("/groups", {
        method: "POST",
        body: JSON.stringify({
          event_id: parseInt(eventId!),
          name: nuevoGrupo.nombre,
          meeting_point: nuevoGrupo.lugarQuedada,
          visibility: nuevoGrupo.visibilidad === "publica" ? "public" : "private",
        }),
      });

      setNuevoGrupo({ nombre: "", lugarQuedada: "", visibilidad: "publica" });
      setMostrarFormulario(false);

      if (data.group.inviteUrl) {
        toast.success(
          `Grupo privado creado. Enlace: ${data.group.inviteUrl}`,
          { duration: 10000 }
        );
      } else {
        toast.success("Grupo público creado correctamente");
      }

      // Recargar grupos
      await cargarGrupos();
    } catch (error: any) {
      toast.error(error.message || "Error al crear el grupo");
    }
  };

  const handleUnirseEnlacePrivado = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para unirte a un grupo");
      return;
    }

    if (!enlacePrivado.trim()) {
      toast.error("Introduce un enlace válido");
      return;
    }

    // Extraer código de invitación del enlace o usar directamente
    let codigo = enlacePrivado.trim();
    
    // Si es una URL completa, extraer el código
    const urlMatch = enlacePrivado.match(/invite=([A-Z0-9]+)/i);
    if (urlMatch) {
      codigo = urlMatch[1];
    } else if (enlacePrivado.includes('/')) {
      // Si tiene barras, tomar la última parte
      codigo = enlacePrivado.split('/').pop() || codigo;
    }

    try {
      const data = await peticionApi("/groups/join-by-invite", {
        method: "POST",
        body: JSON.stringify({
          invite_code: codigo.toUpperCase(),
        }),
      });

      toast.success(`Te has unido al grupo "${data.group.nombre}"`);
      setMostrarEnlacePrivado(false);
      setEnlacePrivado("");
      
      // Recargar grupos
      await cargarGrupos();
    } catch (error: any) {
      toast.error(error.message || "Error al unirse al grupo");
    }
  };

  const handleUnirseGrupo = async (grupoId: number) => {
    if (!user) {
      toast.error("Debes iniciar sesión para unirte a un grupo");
      return;
    }

    try {
      setUnirseCargando(grupoId);
      await peticionApi(`/groups/${grupoId}/join`, {
        method: "POST",
      });

      toast.success("Te has unido al grupo correctamente");
      await cargarGrupos();
    } catch (error: any) {
      toast.error(error.message || "Error al unirse al grupo");
    } finally {
      setUnirseCargando(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navegacion />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate(`/event/${eventId}`)}
              className="text-primary hover:underline mb-2 text-sm"
            >
              ← Volver al evento
            </button>
            <h1 className="text-3xl font-bold text-foreground">Grupos del Evento</h1>
            <p className="text-muted-foreground mt-1">Únete a un grupo o crea el tuyo propio</p>
          </div>
          
          {user && (
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarEnlacePrivado(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Link className="w-4 h-4" />
                Añadir enlace privado
              </button>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Grupo
              </button>
            </div>
          )}
        </div>

        {/* Modal para enlace privado */}
        {mostrarEnlacePrivado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md border border-border shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Unirse a grupo privado</h2>
                <button 
                  onClick={() => setMostrarEnlacePrivado(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4">
                Introduce el enlace que te ha enviado el creador del grupo
              </p>
              
              <input
                type="text"
                value={enlacePrivado}
                onChange={(e) => setEnlacePrivado(e.target.value)}
                placeholder="Pega aquí el enlace del grupo"
                className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarEnlacePrivado(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUnirseEnlacePrivado}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Unirse
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para crear grupo */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md border border-border shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Crear nuevo grupo</h2>
                <button 
                  onClick={() => setMostrarFormulario(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCrearGrupo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre del grupo</label>
                  <input
                    type="text"
                    value={nuevoGrupo.nombre}
                    onChange={(e) => setNuevoGrupo({...nuevoGrupo, nombre: e.target.value})}
                    placeholder="Ej: Amigos del festival"
                    className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Lugar de quedada</label>
                  <input
                    type="text"
                    value={nuevoGrupo.lugarQuedada}
                    onChange={(e) => setNuevoGrupo({...nuevoGrupo, lugarQuedada: e.target.value})}
                    placeholder="Ej: Entrada principal - Puerta A"
                    className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-3">Visibilidad</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setNuevoGrupo({...nuevoGrupo, visibilidad: "publica"})}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                        nuevoGrupo.visibilidad === "publica"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      Pública
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoGrupo({...nuevoGrupo, visibilidad: "privada"})}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                        nuevoGrupo.visibilidad === "privada"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      Privada
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {nuevoGrupo.visibilidad === "publica" 
                      ? "El grupo aparecerá en el listado público"
                      : "Solo se podrá unir mediante enlace"}
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Crear Grupo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Listado de grupos públicos */}
        {cargando ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Cargando grupos...</p>
          </div>
        ) : gruposPublicos.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No hay grupos públicos</h2>
            <p className="text-muted-foreground mb-6">Sé el primero en crear un grupo para este evento</p>
            {user ? (
              <button
                onClick={() => setMostrarFormulario(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Grupo
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">Inicia sesión para crear un grupo</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gruposPublicos.map((grupo) => (
              <div
                key={grupo.id}
                className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{grupo.nombre}</h3>
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        <Globe className="w-3 h-3" />
                        Público
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Quedada:</span>
                    <span>{grupo.lugarQuedada}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Miembros:</span>
                    <span>{grupo.miembros} personas</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {grupo.esMiembro ? (
                    <button 
                      disabled
                      className="w-full py-2 border border-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                    >
                      Ya eres miembro
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUnirseGrupo(grupo.id)}
                      disabled={unirseCargando === grupo.id || !user}
                      className="w-full py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {unirseCargando === grupo.id ? "Uniéndose..." : "Unirse al grupo"}
                    </button>
                  )}
                  <button 
                    onClick={() => navigate(`/miembros-grupo/${grupo.id}`)}
                    className="w-full py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    Ver miembros
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GruposEvento;