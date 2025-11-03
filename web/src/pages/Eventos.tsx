import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navegacion from "@/components/Navegacion";
import EventGrid from "@/components/EventGrid";
import { getAllEventos } from "@/data/eventosFalsos";
import { Search } from "lucide-react";

const Eventos = () => {
  const [searchParams] = useSearchParams();
  const busquedaInicial = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(busquedaInicial);
  const allEventos = getAllEventos();
  
  const eventosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) {
      return allEventos;
    }
    
    return allEventos.filter(evento =>
      evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.lugar.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allEventos, searchTerm]);

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
            
            {/* Barra de busqueda */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  placeholder="Buscar eventos..." 
                  className="pl-10 h-12 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eventos */}
      <EventGrid 
        eventos={eventosFiltrados} 
        titulo={searchTerm ? `Resultados de Búsqueda (${eventosFiltrados.length})` : `Todos los Eventos (${allEventos.length})`} 
      />
    </div>
  );
};

export default Eventos;