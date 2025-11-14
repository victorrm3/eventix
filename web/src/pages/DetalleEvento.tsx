import Navegacion from "@/components/Navegacion";
import { Calendar, Clock, MapPin, Users, Share2, Heart } from "lucide-react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { peticionApi } from "@/lib/api";
import { Evento } from "@/data/eventosFalsos";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DetalleEvento = () => {
  const { id } = useParams();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);

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
          lat: data.event.lat,
          lng: data.event.lng,
          categoria: data.event.category,
          creator: data.event.creator ? {
            id: data.event.creator.id,
            name: data.event.creator.name,
            email: data.event.creator.email,
            profile_image: data.event.creator.profile_image,
          } : undefined,
        };
        
        setEvento(eventoFormateado);
      } catch (error) {
        console.error('Error al cargar evento:', error);
        setEvento(null);
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      cargarEvento();
    }
  }, [id]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-background">
        <Navegacion />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">Cargando evento...</p>
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
              {evento.lat && evento.lng ? (
                <div className="h-64 rounded-lg overflow-hidden">
                  <MapContainer
                    center={[parseFloat(evento.lat), parseFloat(evento.lng)]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[parseFloat(evento.lat), parseFloat(evento.lng)]}>
                      <Popup>
                        <div className="text-center">
                          <strong>{evento.titulo}</strong>
                          <br />
                          {evento.lugar}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-600">No hay coordenadas disponibles para este evento</p>
                </div>
              )}
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
              {evento.creator ? (
                <>
                  <div className="flex items-center space-x-3">
                    {evento.creator.profile_image ? (
                      <img 
                        src={evento.creator.profile_image} 
                        alt={evento.creator.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {evento.creator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{evento.creator.name}</p>
                      <p className="text-sm text-gray-600">{evento.creator.email}</p>
                    </div>
                  </div>
                  <button className="w-full border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors mt-4">
                    Contactar Organizador
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-600">Información del organizador no disponible</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleEvento;