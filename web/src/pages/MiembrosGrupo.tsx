import Navegacion from "@/components/Navegacion";
import { Users, ArrowLeft, Crown, UserCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { peticionApi } from "@/lib/api";
import { toast } from "sonner";

interface Miembro {
  id: number;
  nombre: string;
  email: string;
  avatar?: string | null;
  esCreador: boolean;
  fechaUnion: string;
}

const MiembrosGrupo = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [nombreGrupo, setNombreGrupo] = useState<string>("");
  const [esOwner, setEsOwner] = useState<boolean>(false);
  const [esPrivado, setEsPrivado] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [eventId, setEventId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarMiembros = async () => {
      if (!groupId) return;
      try {
        setCargando(true);
        const data = await peticionApi(`/groups/${groupId}`);
        const grupo = data.group;
        setNombreGrupo(grupo.nombre);
        setEsOwner(grupo.esOwner);
        setEsPrivado(grupo.visibilidad === "privada");
        setInviteCode(grupo.invite_code || null);
        setEventId(grupo.eventId || null);

        const miembrosFormateados: Miembro[] = grupo.members.map((m: any) => ({
          id: m.id,
          nombre: m.name,
          email: m.email,
          avatar: m.profile_image || null,
          esCreador: m.esCreador,
          fechaUnion: m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "",
        }));

        setMiembros(miembrosFormateados);
      } catch (error: any) {
        console.error("Error al cargar miembros del grupo:", error);
        toast.error(error.message || "Error al cargar los miembros del grupo");
      } finally {
        setCargando(false);
      }
    };

    cargarMiembros();
  }, [groupId]);

  return (
    <div className="min-h-screen bg-background">
      <Navegacion />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:underline mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al grupo
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {nombreGrupo || "Miembros del Grupo"}
              </h1>
              <p className="text-muted-foreground">
                {cargando ? "Cargando miembros..." : `${miembros.length} miembros`}
              </p>
            </div>
          </div>
        </div>

        {/* Enlace de invitación para el creador en grupos privados */}
        {esOwner && esPrivado && inviteCode && eventId && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <h2 className="text-sm font-semibold text-emerald-800 mb-2">
              Enlace de invitación al grupo
            </h2>
            <p className="text-xs text-emerald-700 mb-2">
              Comparte este enlace con tus amigos para que se unan al grupo privado.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/grupos/${eventId}?invite=${inviteCode}`}
                className="flex-1 px-3 py-2 text-sm border border-emerald-300 rounded-lg bg-white text-emerald-900"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard
                    .writeText(`${window.location.origin}/grupos/${eventId}?invite=${inviteCode}`)
                    .then(() => toast.success("Enlace copiado al portapapeles"))
                    .catch(() => toast.error("No se pudo copiar el enlace"));
                }}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Copiar
              </button>
            </div>
          </div>
        )}

        {/* Lista de miembros */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {cargando ? (
            <div className="p-6 text-center text-muted-foreground">
              Cargando miembros...
            </div>
          ) : miembros.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Aún no hay miembros en este grupo.
            </div>
          ) : (
            miembros.map((miembro, index) => (
              <div
                key={miembro.id}
                className={`flex items-center justify-between p-4 ${
                  index !== miembros.length - 1 ? "border-b border-border" : ""
                } hover:bg-muted/50 transition-colors`}
              >
                <div className="flex items-center gap-4">
                  {miembro.avatar ? (
                    <img
                      src={miembro.avatar}
                      alt={miembro.nombre}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <UserCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{miembro.nombre}</span>
                      {miembro.esCreador && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                          <Crown className="w-3 h-3" />
                          Creador
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {miembro.fechaUnion
                        ? `Se unió el ${miembro.fechaUnion}`
                        : "Miembro del grupo"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MiembrosGrupo;