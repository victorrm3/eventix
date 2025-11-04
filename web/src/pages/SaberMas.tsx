import Navegacion from "@/components/Navegacion";
import { Calendar, Users, QrCode, MapPin, Star, Award, Share2, TrendingUp, Shield, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const SaberMas = () => {
  const features = [
    {
      icon: Calendar,
      title: "Gestión Completa de Eventos",
      description: "Crea, edita y publica eventos de cualquier tipo: conciertos, talleres, conferencias y más.",
    },
    {
      icon: QrCode,
      title: "Entradas con Código QR",
      description: "Cada entrada genera un código QR único que puede ser validado en el acceso al evento.",
    },
    {
      icon: MapPin,
      title: "Integración con Mapas",
      description: "Visualiza la ubicación exacta de cada evento y encuentra el camino más fácil para llegar.",
    },
    {
      icon: Users,
      title: "Asistencia en Grupo",
      description: "Organiza grupos con punto de encuentro y comparte la experiencia con tus amigos.",
    },
    {
      icon: Share2,
      title: "Entradas Compartidas",
      description: "Divide el coste de las entradas entre varios usuarios y transfiere entradas si no puedes asistir.",
    },
    {
      icon: Star,
      title: "Reseñas Verificadas",
      description: "Solo los asistentes reales pueden dejar reseñas, garantizando autenticidad y confianza.",
    },
    {
      icon: TrendingUp,
      title: "Recomendaciones Personalizadas",
      description: "Recibe sugerencias de eventos basadas en tu historial, ubicación y preferencias.",
    },
    {
      icon: Award,
      title: "Sistema de Logros",
      description: "Gana reconocimiento por tu participación y reseñas útiles en la comunidad.",
    },
  ];

  const adminFeatures = [
    {
      icon: TrendingUp,
      title: "Estadísticas en Tiempo Real",
      description: "Visualiza datos de asistencia, ventas y tendencias de tus eventos.",
    },
    {
      icon: Shield,
      title: "Control de Aforo",
      description: "Gestiona la capacidad de tus eventos y controla el acceso con validación QR.",
    },
    {
      icon: Mail,
      title: "Confirmaciones Automáticas",
      description: "Envío automático de confirmaciones por email con código QR adjunto.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navegacion />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-purple-100 border border-purple-200 rounded-full px-4 py-2 mb-6">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-purple-600 font-medium">Plataforma de Gestión de Eventos</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Bienvenido a
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Eventix
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Una solución moderna, conectada y flexible para la gestión de eventos que combina 
              una experiencia de usuario cuidada con funcionalidades innovadoras tanto para 
              asistentes como para organizadores.
            </p>
          </div>
        </div>
      </section>

      {/* Qué es Eventix */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            ¿Qué es Eventix?
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              Eventix es una aplicación web que permite a organizadores publicar eventos (conciertos, talleres, 
              conferencias, etc.) y a los usuarios reservar o comprar entradas. Cada entrada genera un código QR 
              único que puede ser validado en el acceso al evento.
            </p>
            <p className="text-gray-700 leading-relaxed">
              La plataforma incluye funcionalidades sociales y colaborativas que no están presentes en plataformas 
              comerciales, como la posibilidad de compartir entradas, asistir en grupo, dejar reseñas verificadas 
              y recibir recomendaciones personalizadas. Además, se integra con mapas para mostrar la ubicación de 
              cada evento y ofrece un panel de administración para gestionar eventos, visualizar estadísticas de 
              asistencia y controlar el aforo.
            </p>
          </div>
        </div>
      </section>

      {/* Características principales */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Características Principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para Organizadores */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Herramientas para Organizadores
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {adminFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-8 shadow-lg border border-gray-100"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funciones Sociales */}
      <section className="py-16 bg-gradient-to-r from-purple-100 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Funcionalidades Sociales Únicas
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Eventix va más allá de la simple venta de entradas, ofreciendo una experiencia social completa
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Mapa Social
                </h3>
                <p className="text-gray-600 text-sm">
                  Descubre qué eventos siguen tus amigos o usuarios con intereses similares
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Share2 className="w-5 h-5 mr-2 text-purple-600" />
                  Transferencia de Entradas
                </h3>
                <p className="text-gray-600 text-sm">
                  Si no puedes asistir, transfiere tu entrada a otro usuario fácilmente
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                  Puntos de Encuentro
                </h3>
                <p className="text-gray-600 text-sm">
                  Organiza quedadas con tu grupo antes del evento con puntos de encuentro definidos
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-600" />
                  Sistema de Logros
                </h3>
                <p className="text-gray-600 text-sm">
                  Gana reconocimiento por tu participación activa y reseñas útiles
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a Eventix y descubre una nueva forma de disfrutar eventos
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link to="/eventos">
              <button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg">
                Ver Eventos
              </button>
            </Link>
            <Link to="/crear-evento">
              <button className="bg-purple-800 text-white hover:bg-purple-900 px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg">
                Crear Evento
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SaberMas;