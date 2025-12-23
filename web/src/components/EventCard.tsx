import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatearFecha } from "@/lib/utils";

// Componente de la carta del evento.
// Muestra la imagen, título, breve descripción, detalles y un CTA para obtener entradas.

// Tipos de datos del evento. Mantener simples: la fecha se recibe como string,
// `hora` como texto representativo (ej. "20:00") y `imagen` como URL.
interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  precio: number;
  imagen: string;
  personas: number;
  maxPersonas: number;
}

interface EventCardProps {
  evento: Evento;
}

const EventCard = ({ evento }: EventCardProps) => {
  return (
    <div className="overflow-hidden bg-white rounded-lg border hover:shadow-lg transition-all group">
      {/* Imagen del evento */}
        <div className="relative h-48 overflow-hidden">
        <img 
          src={evento.imagen} 
          alt={evento.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-all"
        />
        <div className="absolute top-4 right-4">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            €{evento.precio}
          </div>
        </div>
      </div>

      {/* Contenido del evento */}
      <div className="p-6">
        <Link to={`/event/${evento.id}`}>
          <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors cursor-pointer">
            {evento.titulo}
          </h3>
        </Link>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {evento.descripcion}
        </p>

        {/* Detalles del evento */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            {/* formatearFecha se encarga del formateo legible de la fecha */}
            {formatearFecha(evento.fecha)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            {evento.hora}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            {evento.lugar}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            {/* Muestra asistentes actuales frente al máximo permitido */}
            {evento.personas} / {evento.maxPersonas} asistentes
          </div>
        </div>

        {/* Botón de comprar */}
        <Link to={`/event/${evento.id}`}>
          <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg px-4 py-2 rounded-md font-semibold transition-all hover:from-purple-700 hover:to-blue-700">
            Obtener Entradas
          </button>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;