import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Sparkles, Filter } from "lucide-react";
import imagenPrincipal from "@/assets/imagen-princ.jpg";

//Componente de la página principal de la imagen gigante con fundido blanco
const Principal = () => {
  const [buscarTerm, setBuscarTerm] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const navegar = useNavigate();

  const handleBuscarEventos = () => {
    const params = new URLSearchParams();
    if (buscarTerm.trim()) params.append('search', buscarTerm);
    if (categoria) params.append('category', categoria);
    if (fechaDesde) params.append('dateFrom', fechaDesde);
    if (fechaHasta) params.append('dateTo', fechaHasta);
    
    const queryString = params.toString();
    navegar(`/eventos${queryString ? `?${queryString}` : ''}`);
  };
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <img 
          src={imagenPrincipal} 
          alt="Event venue with colorful lights"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/90" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 opacity-20" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Placa */}
          <div className="inline-flex items-center space-x-2 bg-purple-100 border border-purple-200 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-purple-600 font-medium">Plataforma Premium de Eventos</span>
          </div>

          {/* Cabecera principal */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Descubre Eventos
            <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent">
              Increíbles Cerca de Ti
            </span>
          </h1>

          {/* Subtitulo */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Desde conciertos hasta conferencias, encuentra y compra entradas para los eventos más emocionantes 
            de tu zona. Crea recuerdos que durarán toda la vida.
          </p>

          {/* Barra de busqueda */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  placeholder="Buscar eventos..." 
                  className="pl-10 h-12 bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-purple-500 shadow-lg rounded-md w-full px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  value={buscarTerm}
                  onChange={(e) => setBuscarTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscarEventos()}
                />
              </div>
              
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select 
                    className="pl-9 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-purple-500 rounded-md w-full px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none cursor-pointer"
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
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="date"
                    placeholder="Desde"
                    className="pl-9 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-purple-500 rounded-md w-full px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="date"
                    placeholder="Hasta"
                    className="pl-9 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-purple-500 rounded-md w-full px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-center space-x-4">
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105 transition-all font-semibold rounded-md flex items-center" onClick={handleBuscarEventos}>
              <Calendar className="w-5 h-5 mr-2" />
              Explorar Eventos
            </button>
            <button className="px-8 py-3 backdrop-blur-sm border border-gray-300 hover:bg-gray-50 rounded-md font-semibold transition-colors" onClick={() => navegar('/crear-evento')}>
              Crear Evento
            </button>
          </div>
        </div>
      </div>

      {/* Pijotadas */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

export default Principal;