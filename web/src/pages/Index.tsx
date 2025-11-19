import Navegacion from "@/components/Navegacion";
import Principal from "@/components/Principal";
import EventGrid from "@/components/EventGrid";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { peticionApi } from "@/lib/api";
import { Evento } from "@/data/eventosFalsos";

const Index = () => {
  const [eventosDestacados, setEventosDestacados] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarEventosDestacados = async () => {
      try {
        setCargando(true);
        const data = await peticionApi('/events?featured=true');
        
        const eventosFormateados = data.events
          .filter((evento: any) => {
            // Parsear manualmente para evitar problemas de zona horaria
            const [year, month, day] = evento.date.split('-').map(Number);
            const fechaEvento = new Date(year, month - 1, day);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            fechaEvento.setHours(0, 0, 0, 0);
            return fechaEvento.getTime() >= hoy.getTime();
          })
          .map((evento: any) => ({
            id: evento.id.toString(),
            titulo: evento.title,
            descripcion: evento.description,
            fecha: evento.date,
            hora: evento.time,
            lugar: evento.location,
            precio: evento.price,
            imagen: evento.image_url || '/placeholder.jpg',
            personas: evento.attendees,
            maxPersonas: evento.capacity,
            lat: evento.lat,
            lng: evento.lng,
            categoria: evento.category,
          }));
        
        setEventosDestacados(eventosFormateados);
      } catch (error) {
        console.error('Error al cargar eventos destacados:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarEventosDestacados();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navegacion />
      <Principal />
      {cargando ? (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg text-muted-foreground">Cargando eventos destacados...</p>
          </div>
        </section>
      ) : (
        <EventGrid eventos={eventosDestacados} titulo="Eventos Destacados" />
      )}
      
      {/* Seccion inferior */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para Organizar tu Propio Evento?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Únete a miles de organizadores de eventos que confían en EVENTIX para gestionar sus eventos 
            y conectar con su audiencia.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link to="/crear-evento">
              <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                Empezar a Crear
              </button>
            </Link>
            <Link to="/saber-mas">
              <button className="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Saber Más
              </button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Index;


