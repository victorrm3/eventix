import EventCard from "@/components/EventCard";
import { Evento } from "@/data/eventosFalsos";

interface EventGridProps {
  eventos: Evento[];
  titulo?: string;
}

const EventGrid = ({ eventos, titulo = "Eventos destacados" }: EventGridProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {titulo}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubre eventos increíbles que están sucediendo en tu zona. 
            Desde reuniones íntimas hasta festivales a gran escala, encuentra tu próxima experiencia inolvidable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventos.map((evento) => (
            <EventCard key={evento.id} evento={evento} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventGrid;