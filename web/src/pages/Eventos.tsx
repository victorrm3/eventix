import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navegacion from "@/components/Navegacion";
import EventGrid from "@/components/EventGrid";
import Footer from "@/components/Footer";
import { Search, Filter, Calendar } from "lucide-react";
import { peticionApi } from "@/lib/api";
import { Evento } from "@/data/eventosFalsos";

const Eventos = () => {
  const [searchParams] = useSearchParams();
  const busquedaInicial = searchParams.get('search') || '';
  const categoriaInicial = searchParams.get('category') || '';
  const fechaDesdeInicial = searchParams.get('dateFrom') || '';
  const fechaHastaInicial = searchParams.get('dateTo') || '';
  
  const [searchTerm, setSearchTerm] = useState(busquedaInicial);
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [fechaDesde, setFechaDesde] = useState(fechaDesdeInicial);
  const [fechaHasta, setFechaHasta] = useState(fechaHastaInicial);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setCargando(true);
        const data = await peticionApi('/events');
        
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
            categoria: evento.category,
          }));
        
        setEventos(eventosFormateados);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarEventos();
  }, []);
  
  const eventosFiltrados = useMemo(() => {
    return eventos.filter(evento => {
      // Filtro de búsqueda por texto
      const matchesSearch = !searchTerm.trim() || 
        evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.lugar.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por categoría
      const matchesCategoria = !categoria || evento.categoria === categoria;
      
      // Filtro por fecha desde
      const matchesFechaDesde = !fechaDesde || evento.fecha >= fechaDesde;
      
      // Filtro por fecha hasta
      const matchesFechaHasta = !fechaHasta || evento.fecha <= fechaHasta;
      
      return matchesSearch && matchesCategoria && matchesFechaDesde && matchesFechaHasta;
    });
  }, [eventos, searchTerm, categoria, fechaDesde, fechaHasta]);

  return (
    <div className="min-h-screen bg-background">
      <Navegacion />
      
      {/* Cabecera */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Todos los Eventos
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Descubre todos los eventos disponibles. Usa el buscador para encontrar exactamente lo que buscas.
            </p>
            
            {/* Barra de busqueda y filtros */}
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input 
                    placeholder="Buscar eventos..." 
                    className="pl-10 h-12 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <select 
                      className="pl-9 h-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer bg-background"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                    >
                      <option value="">Selecciona una categoría</option>
                      <option value="Concierto">Concierto</option>
                      <option value="Conferencia">Conferencia</option>
                      <option value="Festival">Festival</option>
                      <option value="Deportes">Deportes</option>
                      <option value="Arte">Arte</option>
                      <option value="Teatro">Teatro</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input 
                      type="date"
                      placeholder="Desde"
                      className="pl-9 h-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-background"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                    />
                  </div>
                  
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input 
                      type="date"
                      placeholder="Hasta"
                      className="pl-9 h-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-background"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eventos */}
      {cargando ? (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg text-muted-foreground">Cargando eventos...</p>
          </div>
        </section>
      ) : (
        <EventGrid 
          eventos={eventosFiltrados} 
          titulo={`Todos los Eventos (${eventosFiltrados.length})`}
        />
      )}
      <Footer />
    </div>
  );
};

export default Eventos;