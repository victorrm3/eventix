import Navegacion from "@/components/Navegacion";
import { Users, Globe, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { peticionApi } from "@/lib/api";
import { toast } from "sonner";

interface GrupoUnido {
  id: number;
  nombre: string;
  lugarQuedada: string;
  visibilidad: "publica" | "privada";
  miembros: number;
  eventoId: number;
  eventoNombre: string;
  esOwner: boolean;
}

const TusGrupos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gruposUnidos, setGruposUnidos] = useState<GrupoUnido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [saliendoId, setSaliendoId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const cargarGrupos = async () => {
      try {
        setCargando(true);
        const data = await peticionApi("/user/groups");
        setGruposUnidos(data.groups || []);
      } catch (error: any) {
        console.error("Error al cargar tus grupos:", error);
        toast.error(error.message || "Error al cargar tus grupos");
      } finally {
        setCargando(false);
      }
    };

    cargarGrupos();
  }, [user, navigate]);

  const handleSalirGrupo = async (grupoId: number) => {
    try {
      setSaliendoId(grupoId);
      await peticionApi(`/groups/${grupoId}/leave`, {
        method: "DELETE",
      });
      toast.success("Has salido del grupo correctamente");
      setGruposUnidos((prev) => prev.filter((g) => g.id !== grupoId));
    } catch (error: any) {
      console.error("Error al salir del grupo:", error);
      toast.error(error.message || "Error al salir del grupo");
    } finally {
      setSaliendoId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navegacion />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Tus Grupos</h1>
          <p className="text-muted-foreground mt-1">Grupos a los que te has unido</p>
        </div>

        {/* Lista de grupos */}
        {cargando ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">Cargando tus grupos...</p>
          </div>
        ) : gruposUnidos.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No te has unido a ningún grupo</h2>
            <p className="text-muted-foreground mb-6">
              Explora los eventos y únete a grupos para quedar con otros asistentes
            </p>
            <button
              onClick={() => navigate("/eventos")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Explorar eventos
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gruposUnidos.map((grupo) => (
              <div
                key={grupo.id}
                className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{grupo.nombre}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        grupo.visibilidad === "publica" 
                          ? "text-green-600 bg-green-100" 
                          : "text-purple-600 bg-purple-100"
                      }`}>
                        {grupo.visibilidad === "publica" ? (
                          <>
                            <Globe className="w-3 h-3" />
                            Público
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            Privado
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <span className="text-xs text-muted-foreground">Evento:</span>
                  <p className="text-sm font-medium text-foreground">{grupo.eventoNombre}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">📍</span>
                    <span>{grupo.lugarQuedada}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">👥</span>
                    <span>{grupo.miembros} miembros</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/miembros-grupo/${grupo.id}`)}
                    className="flex-1 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    Ver miembros
                  </button>
                  {!grupo.esOwner && (
                    <button
                      onClick={() => handleSalirGrupo(grupo.id)}
                      disabled={saliendoId === grupo.id}
                      className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
                    >
                      {saliendoId === grupo.id ? "Saliendo..." : "Salir del grupo"}
                    </button>
                  )}
                  <button 
                    onClick={() => navigate(`/event/${grupo.eventoId}`)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    <ArrowRight className="w-4 h-4" />
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

export default TusGrupos;