import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navegacion from "@/components/Navegacion";
import { Ticket, Users } from "lucide-react";
import { peticionApi } from "@/lib/api";
import { Evento } from "@/data/eventosFalsos";
import { toast } from "sonner";

const ComprarEntradas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [tipoEntrada, setTipoEntrada] = useState<'singular' | 'compartida' | null>(null);
  const [emailCompartido, setEmailCompartido] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const cargarEvento = async () => {
      try {
        setCargando(true);
        const data = await peticionApi(`/events/${id}`);
        
        const eventoFormateado = {
          id: data.event.id.toString(),
          titulo: data.event.title,
          descripcion: data.event.description,
          fecha: data.event.date,
          hora: data.event.time,
          lugar: data.event.location,
          precio: data.event.price,
          imagen: data.event.image_url || '/placeholder.jpg',
          personas: data.event.attendees,
          maxPersonas: data.event.capacity,
          entradaCompartidaHabilitada: data.event.shareable || false,
        };
        
        setEvento(eventoFormateado);
      } catch (error) {
        console.error('Error al cargar evento:', error);
        toast.error('Error al cargar el evento');
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      cargarEvento();
    }
  }, [id]);

  const handleCompra = async () => {
    if (!tipoEntrada) {
      toast.error('Selecciona un tipo de entrada');
      return;
    }

    if (tipoEntrada === 'compartida' && !emailCompartido) {
      toast.error('Ingresa el email del usuario con quien compartirás la entrada');
      return;
    }

    if (tipoEntrada === 'compartida' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCompartido)) {
      toast.error('Ingresa un email válido');
      return;
    }

    setProcesando(true);
    
    try {
      const datosCompra = {
        event_id: parseInt(id!),
        ticket_type: tipoEntrada,
        shared_with_email: tipoEntrada === 'compartida' ? emailCompartido : null,
        total_price: tipoEntrada === 'compartida' 
          ? parseFloat(((evento?.precio || 0) * 1.66).toFixed(2))
          : evento?.precio || 0,
      };

      await peticionApi('/tickets/purchase', {
        method: 'POST',
        body: JSON.stringify(datosCompra),
      });
      
      toast.success('¡Compra realizada exitosamente! Revisa tu correo.');
      navigate(`/event/${id}`);
    } catch (error: any) {
      console.error('Error en la compra:', error);
      toast.error(error.message || 'Error al procesar la compra');
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-background">
        <Navegacion />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-background">
        <Navegacion />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Evento No Encontrado</h1>
        </div>
      </div>
    );
  }

  const precioCompartida = evento.precio * 1.66;

  return (
    <div className="min-h-screen bg-background">
      <Navegacion />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Comprar Entradas</h1>
          <p className="text-muted-foreground">{evento.titulo}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Entrada Singular */}
          <div 
            onClick={() => setTipoEntrada('singular')}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              tipoEntrada === 'singular' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                tipoEntrada === 'singular' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Ticket className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Entrada Singular</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Una entrada individual para el evento
                </p>
                <div className="text-2xl font-bold text-primary">
                  €{evento.precio.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Entrada Compartida */}
          <div 
            onClick={() => evento.entradaCompartidaHabilitada && setTipoEntrada('compartida')}
            className={`p-6 rounded-lg border-2 transition-all ${
              !evento.entradaCompartidaHabilitada 
                ? 'opacity-50 cursor-not-allowed' 
                : tipoEntrada === 'compartida'
                ? 'border-primary bg-primary/5 cursor-pointer'
                : 'border-border hover:border-primary/50 cursor-pointer'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                tipoEntrada === 'compartida' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  Entrada Compartida
                  {!evento.entradaCompartidaHabilitada && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (No disponible)
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comparte la entrada con otro usuario (33% más económica que 2 entradas)
                </p>
                <div className="text-2xl font-bold text-primary">
                  €{precioCompartida.toFixed(2)}
                </div>
                {evento.entradaCompartidaHabilitada && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Ahorro: €{(evento.precio * 2 - precioCompartida).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Formulario para entrada compartida */}
        {tipoEntrada === 'compartida' && (
          <div className="mt-6 p-6 bg-muted rounded-lg">
            <label className="block text-sm font-medium mb-2">
              Email del usuario con quien compartirás la entrada
            </label>
            <input
              type="email"
              value={emailCompartido}
              onChange={(e) => setEmailCompartido(e.target.value)}
              placeholder="usuario@ejemplo.com"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {/* Resumen y botón de compra */}
        {tipoEntrada && (
          <div className="mt-8 p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Resumen de Compra</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Tipo de entrada:</span>
                <span className="font-semibold">
                  {tipoEntrada === 'singular' ? 'Entrada Singular' : 'Entrada Compartida'}
                </span>
              </div>
              {tipoEntrada === 'compartida' && emailCompartido && (
                <div className="flex justify-between">
                  <span>Compartida con:</span>
                  <span className="font-semibold">{emailCompartido}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">
                  €{(tipoEntrada === 'compartida' ? precioCompartida : evento.precio).toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={handleCompra}
              disabled={procesando}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-md font-semibold transition-all disabled:opacity-50"
            >
              {procesando ? 'Procesando...' : 'Confirmar Compra'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprarEntradas;