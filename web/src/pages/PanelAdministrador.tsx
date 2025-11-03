import Navigation from "@/components/Navegacion";
import { Plus, Calendar, Users, DollarSign, BarChart3 } from "lucide-react";
import { eventosFalsos } from "@/data/eventosFalsos";

const PanelAdministrador = () => {
  const estadisticas = [
    {
      titulo: "Total de Eventos",
      valor: eventosFalsos.length,
      icono: Calendar,
      trend: "+12%",
    },
    {
      titulo: "Total de Asistentes",
      valor: eventosFalsos.reduce((sum, event) => sum + event.personas, 0),
      icono: Users,
      trend: "+23%",
    },
    {
      titulo: "Ingresos",
      valor: `€${eventosFalsos.reduce((sum, event) => sum + (event.precio * event.personas), 0).toLocaleString()}`,
      icono: DollarSign,
      trend: "+18%",
    },
    {
      titulo: "Asistencia Media",
      valor: `${Math.round(eventosFalsos.reduce((sum, event) => sum + (event.personas / event.maxPersonas), 0) / eventosFalsos.length * 100)}%`,
      icono: BarChart3,
      trend: "+5%",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestiona tus eventos y rastrea el rendimiento</p>
          </div>
          <button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-medium flex items-center space-x-2 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Evento</span>
          </button>
        </div>

        {/* Estadísticas de administrador */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {estadisticas.map((stat, index) => {
            const Icon = stat.icono;
            return (
              <div key={index} className="p-6 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.titulo}</p>
                    <p className="text-2xl font-bold">{stat.valor}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.trend}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Formulario de crear evento rápido */}
        <div className="p-6 bg-white rounded-lg border shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-6">Crear Evento Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título del Evento</label>
                <input id="title" placeholder="Introduce el título del evento" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input id="date" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <input id="time" type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Precio (€)</label>
                <input id="price" type="number" placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input id="location" placeholder="Introduce la ubicación del lugar" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">Capacidad Máxima</label>
                <input id="capacity" type="number" placeholder="100" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea id="description" placeholder="Descripción del evento" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[100px] resize-none" />
              </div>
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-md font-medium transition-all">
                Crear Evento
              </button>
            </div>
          </div>
        </div>

        {/* Eventos recientes */}
        <div className="p-6 bg-white rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Eventos Recientes</h2>
          <div className="space-y-4">
            {eventosFalsos.slice(0, 5).map((evento) => (
              <div key={evento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <img 
                    src={evento.imagen} 
                    alt={evento.titulo}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{evento.titulo}</h3>
                    <p className="text-sm text-gray-600">{evento.fecha} • {evento.lugar}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{evento.personas} / {evento.maxPersonas}</p>
                  <p className="text-sm text-gray-600">€{evento.precio * evento.personas}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelAdministrador;