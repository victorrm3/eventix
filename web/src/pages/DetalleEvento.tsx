import Navegacion from "@/components/Navegacion";
import { Calendar, Clock, MapPin, Users, Share2, Heart } from "lucide-react";
import { useParams } from "react-router-dom";
import { eventosFalsos } from "@/data/eventosFalsos";
import { QRCodeSVG } from "qrcode.react";

const DetalleEvento = () => {
  const { id } = useParams();
  const evento = eventosFalsos.find(e => e.id === id);

  if (!evento) {
    return (
      <div className="min-h-screen bg-background">
        <Navegacion />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Evento No Encontrado</h1>
          <p className="text-muted-foreground">El evento que buscas no existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navegacion />
      
      <div className="container mx-auto px-4 py-8">
        {/* Seccion principal */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
          <img 
            src={evento.imagen} 
            alt={evento.titulo}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-4xl font-bold mb-2">{evento.titulo}</h1>
            <p className="text-lg opacity-90">{evento.lugar}</p>
          </div>
          <div className="absolute top-6 right-6 flex space-x-2">
            <button className="p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-md transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-md transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2">
            {/* Información del evento */}
            <div className="p-6 bg-white rounded-lg border shadow-sm mb-6">
              <h2 className="text-2xl font-semibold mb-4">Detalles del Evento</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {evento.descripcion}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Fecha</p>
                    <p className="text-sm text-muted-foreground">{evento.fecha}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Hora</p>
                    <p className="text-sm text-muted-foreground">{evento.hora}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Ubicación</p>
                    <p className="text-sm text-muted-foreground">{evento.lugar}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Asistentes</p>
                    <p className="text-sm text-muted-foreground">{evento.personas} / {evento.maxPersonas}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Ubicación</h2>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">El mapa interactivo se mostrará aquí</p>
              </div>
            </div>
          </div>

          {/* Barra lateral */}
          <div className="space-y-6">
            {/* Compra de tickets */}
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  €{evento.precio}
                </div>
                <p className="text-gray-600">por entrada</p>
              </div>
              
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-4 py-3 rounded-md font-semibold text-lg transition-all">
                  Comprar Entradas
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors">
                  Añadir a Favoritos
                </button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span>Disponibles</span>
                  <span>{evento.maxPersonas - evento.personas} entradas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full" 
                    style={{ width: `${(evento.personas / evento.maxPersonas) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Demo del QR*/}
            <div className="p-6 text-center bg-white rounded-lg border shadow-sm">
              <h3 className="font-semibold mb-4">Código QR del Evento</h3>
              <div className="flex justify-center mb-4">
                <QRCodeSVG value={`https://eventix.com/event/${evento.id}`} size={120} />
              </div>
              <p className="text-sm text-gray-600">
                Escanea para compartir este evento
              </p>
            </div>

            {/* Organizador */}
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <h3 className="font-semibold mb-4">Organizador</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">EX</span>
                </div>
                <div>
                  <p className="font-semibold">Equipo EVENTIX</p>
                  <p className="text-sm text-gray-600">Eventos Premium</p>
                </div>
              </div>
              <button className="w-full border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors mt-4">
                Contactar Organizador
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleEvento;