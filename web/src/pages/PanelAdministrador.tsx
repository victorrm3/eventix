import Navigation from "@/components/Navegacion";
import EventosActivos from "@/components/EventosActivos";
import { Plus, Calendar, Users, DollarSign, BarChart3, TrendingUp } from "lucide-react";
import { eventosFalsos } from "@/data/eventosFalsos";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useState, useEffect } from "react";
import { peticionApi } from "@/lib/api";
import { Evento } from "@/data/eventosFalsos";

const PanelAdministrador = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargandoEventos, setCargandoEventos] = useState(true);
  
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

  // Datos para gráficos
  const datosVentasPorMes = [
    { mes: "Ene", ventas: 4500 },
    { mes: "Feb", ventas: 5200 },
    { mes: "Mar", ventas: 4800 },
    { mes: "Abr", ventas: 6100 },
    { mes: "May", ventas: 7300 },
    { mes: "Jun", ventas: 8500 },
  ];

  const datosDistribucionPrecios = [
    { rango: "Gratis", value: eventosFalsos.filter(e => e.precio === 0).length },
    { rango: "€1-50", value: eventosFalsos.filter(e => e.precio > 0 && e.precio <= 50).length },
    { rango: "€51-100", value: eventosFalsos.filter(e => e.precio > 50 && e.precio <= 100).length },
    { rango: "€100+", value: eventosFalsos.filter(e => e.precio > 100).length },
  ].filter(item => item.value > 0);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

  const datosAsistenciaSemanal = [
    { dia: "Lun", asistentes: 245 },
    { dia: "Mar", asistentes: 312 },
    { dia: "Mie", asistentes: 289 },
    { dia: "Jue", asistentes: 401 },
    { dia: "Vie", asistentes: 520 },
    { dia: "Sab", asistentes: 680 },
    { dia: "Dom", asistentes: 590 },
  ];

  // Cargar eventos activos del backend
  useEffect(() => {
    const cargarEventosActivos = async () => {
      try {
        setCargandoEventos(true);
        const data = await peticionApi('/admin/events/active');
        
        const eventosFormateados = data.events.map((evento: any) => ({
          id: evento.id.toString(),
          titulo: evento.title,
          descripcion: evento.description,
          fecha: evento.date,
          hora: evento.time,
          lugar: evento.location,
          precio: evento.price,
          imagen: evento.image_url || '/placeholder.jpg',
          personas: evento.attendees || 0,
          maxPersonas: evento.capacity,
        }));
        
        setEventos(eventosFormateados);
      } catch (error) {
        console.error('Error al cargar eventos activos:', error);
        // Si hay error, usar eventos falsos como fallback
        setEventos(eventosFalsos);
      } finally {
        setCargandoEventos(false);
      }
    };

    cargarEventosActivos();
  }, []);

  const recargarEventos = () => {
    const cargarEventosActivos = async () => {
      try {
        const data = await peticionApi('/admin/events/active');
        
        const eventosFormateados = data.events.map((evento: any) => ({
          id: evento.id.toString(),
          titulo: evento.title,
          descripcion: evento.description,
          fecha: evento.date,
          hora: evento.time,
          lugar: evento.location,
          precio: evento.price,
          imagen: evento.image_url || '/placeholder.jpg',
          personas: evento.attendees || 0,
          maxPersonas: evento.capacity,
        }));
        
        setEventos(eventosFormateados);
      } catch (error) {
        console.error('Error al recargar eventos:', error);
      }
    };

    cargarEventosActivos();
  };

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
          <button 
            onClick={() => navigate('/admin/crear-evento')}
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-4 py-2 rounded-md font-medium flex items-center space-x-2 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Evento</span>
          </button>
        </div>

        {/* Estadísticas de administrador */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {estadisticas.map((stat, index) => {
            const Icon = stat.icono;
            return (
              <div key={index} className="p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.titulo}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.valor}</p>
                    <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/60 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Métricas visuales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Ventas por mes */}
          <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Ingresos Mensuales</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosVentasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución por precios */}
          <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Distribución por Rango de Precio</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosDistribucionPrecios}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ rango, percent }) => `${rango} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {datosDistribucionPrecios.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Asistencia semanal */}
          <div className="p-6 bg-card rounded-lg border border-border shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Tendencia de Asistencia Semanal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosAsistenciaSemanal}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="asistentes" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sección de Eventos Activos */}
        <div className="mb-8">
          <EventosActivos 
            eventos={eventos} 
            onEventoActualizado={recargarEventos}
          />
        </div>

        {/* Eventos recientes */}
        <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Eventos Recientes</h2>
          <div className="space-y-4">
            {eventosFalsos.slice(0, 5).map((evento) => (
              <div key={evento.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center space-x-4">
                  <img 
                    src={evento.imagen} 
                    alt={evento.titulo}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{evento.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{evento.fecha} • {evento.lugar}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{evento.personas} / {evento.maxPersonas}</p>
                  <p className="text-sm text-muted-foreground">€{evento.precio * evento.personas}</p>
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
