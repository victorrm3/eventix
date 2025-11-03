import Navegacion from "@/components/Navegacion";
import Principal from "@/components/Principal";
import EventGrid from "@/components/EventGrid";
import { getEventosDestacados } from "@/data/eventosFalsos";

const Index = () => {
  const eventosDestacados = getEventosDestacados();

  return (
    <div className="min-h-screen bg-background">
      <Navegacion />
      <Principal />
      <EventGrid eventos={eventosDestacados} titulo="Eventos Destacados" />
      
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
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Empezar a Crear
            </button>
            <button className="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Saber Más
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

