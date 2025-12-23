import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Evento } from "@/data/eventosFalsos";
import { Edit, Trash2, Calendar, MapPin, Users } from "lucide-react";
import { formatearFecha, esEventoFuturo } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { peticionApi } from "@/lib/api";
import { toast } from "sonner";

//Este componente pertenece al panel de Administración del Admin mas concretamente al CRUD de Eventos dentro de este

interface EventosActivosProps {
  eventos: Evento[];
  onEventoActualizado: () => void; // Callback para actualizar la lista tras cambios
}

const EventosActivos = ({ eventos, onEventoActualizado }: EventosActivosProps) => {
  const navigate = useNavigate();

  // Estado para controlar qué evento se está intentando cancelar (id o null)
  const [eventoACancelar, setEventoACancelar] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Filtramos sólo los eventos futuros para que el administrador vea sólo los activos
  const eventosFuturos = eventos.filter((evento) => esEventoFuturo(evento.fecha));

  const handleEditarEvento = (eventoId: string) => {
    navigate(`/admin/editar-evento/${eventoId}`);
  };

  // Realiza la petición de cancelación al backend. Maneja estados y notificaciones.
  const handleCancelarEvento = async (eventoId: string) => {
    setCargando(true);
    try {
      await peticionApi(`/events/${eventoId}`, {
        method: 'DELETE',
      });
      toast.success('Evento cancelado exitosamente. Los reembolsos serán procesados.');
      onEventoActualizado();
    } catch (error) {
      toast.error('Error al cancelar el evento. Por favor intenta de nuevo.');
      console.error('Error al cancelar evento:', error);
    } finally {
      setCargando(false);
      setEventoACancelar(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Eventos Activos</h2>
        <p className="text-muted-foreground">
          Gestiona tus eventos programados ({eventosFuturos.length} activos)
        </p>
      </div>

      {/* Mostrar mensaje si no hay eventos activos */}
      {eventosFuturos.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay eventos activos en este momento</p>
        </div>
      ) : (
        // Lista de eventos: cada tarjeta contiene info y acciones (editar/cancelar)
        <div className="grid grid-cols-1 gap-4">
          {eventosFuturos.map((evento) => (
            <div
              key={evento.id}
              className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Imagen del evento */}
                <div className="flex-shrink-0">
                  <img
                    src={evento.imagen}
                    alt={evento.titulo}
                    className="w-full md:w-48 h-32 object-cover rounded-lg"
                  />
                </div>

                {/* Información del evento */}
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2">{evento.titulo}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatearFecha(evento.fecha)} - {evento.hora}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {evento.lugar}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {evento.personas} / {evento.maxPersonas} asistentes
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {evento.precio === 0 ? 'Gratis' : `€${evento.precio}`}
                    </span>

                    {/* Botones de acción: editar abre el formulario, cancelar abre el diálogo */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditarEvento(evento.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button
                        onClick={() => setEventoACancelar(evento.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Cancelar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diálogo de confirmación para cancelar evento.
          Se abre cuando `eventoACancelar` tiene un id; cerrar resetea a null.
          El botón de acción llama a `handleCancelarEvento` y muestra estado de carga. */}
      <AlertDialog open={eventoACancelar !== null} onOpenChange={() => setEventoACancelar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro que quiere cancelar el evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos los ingresos se rembolsarán a los clientes. Esta acción no se puede deshacer
              y el evento será marcado como cancelado en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cargando}>No, mantener evento</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => eventoACancelar && handleCancelarEvento(eventoACancelar)}
              disabled={cargando}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cargando ? 'Cancelando...' : 'Sí, cancelar evento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventosActivos;