import { Users, Calendar, MapPin, Star } from "lucide-react";

const Estadisticas = () => {
  const estadisticas = [
    {
      icono: Calendar,
      valor: "2,500+",
      etiqueta: "Eventos creados",
    },
    {
      icono: Users,
      valor: "50K+",
      etiqueta: "Personas contentas",
    },
    {
      icono: MapPin,
      valor: "120+",
      etiqueta: "Ciudades cubiertas",
    },
    {
      icono: Star,
      valor: "4.9/5",
      etiqueta: "Puntuación usuarios",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {estadisticas.map((stat, index) => {
            const Icon = stat.icono;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2 text-gray-900">{stat.valor}</div>
                <div className="text-gray-600">{stat.etiqueta}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Estadisticas;