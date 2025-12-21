import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navegacion from "@/components/Navegacion";
import Footer from "@/components/Footer";
import { Trophy, Lock, Ticket, Star, Users, Heart, Check } from "lucide-react";
import { peticionApi } from "@/lib/api";

interface Logro {
  id: string;
  type: string;
  titulo: string;
  descripcion: string;
  desbloqueado: boolean;
  progreso: number;
  objetivo: number;
  unlocked_at?: string;
}

const Logros = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [logros, setLogros] = useState<Logro[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    } else if (user) {
      cargarLogros();
    }
  }, [user, isLoading, navigate]);

  const cargarLogros = async () => {
    try {
      setCargando(true);
      const data = await peticionApi("/user/achievements");
      console.log("Logros recibidos:", data.achievements);
      setLogros(data.achievements || []);
    } catch (error) {
      console.error("Error al cargar logros:", error);
      setLogros([]);
    } finally {
      setCargando(false);
    }
  };

  const getIcono = (type: string) => {
    if (type.includes('ticket')) {
      return <Ticket className="w-8 h-8" />;
    } else if (type.includes('review')) {
      return <Star className="w-8 h-8" />;
    } else if (type.includes('friend')) {
      return <Users className="w-8 h-8" />;
    } else if (type.includes('favorite')) {
      return <Heart className="w-8 h-8" />;
    }
    return <Trophy className="w-8 h-8" />;
  };

  if (isLoading || cargando) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navegacion />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navegacion />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Mis Logros</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {logros.map((logro) => {
              const isUnlocked = logro.desbloqueado === true;
              return (
              <div
                key={logro.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  isUnlocked
                    ? "bg-green-500/10 shadow-lg"
                    : "bg-muted/50 border-gray-300 opacity-75"
                }`}
                style={isUnlocked ? { borderColor: '#10b981' } : {}}
              >
                {isUnlocked ? (
                  <div className="absolute top-3 right-3">
                    <div className="bg-green-500 rounded-full p-1.5 flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                
                <div
                  className={`mb-4 ${
                    isUnlocked ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {getIcono(logro.type)}
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {logro.titulo}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {logro.descripcion}
                </p>

                {logro.progreso !== undefined && logro.objetivo !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progreso</span>
                      <span>{logro.progreso}/{logro.objetivo}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isUnlocked ? "bg-primary" : "bg-primary/50"
                        }`}
                        style={{
                          width: `${Math.min((logro.progreso / logro.objetivo) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {isUnlocked && (
                  <div className="mt-4 text-xs text-primary font-medium">
                    ✓ Desbloqueado
                    {logro.unlocked_at && (
                      <div className="text-muted-foreground mt-1">
                        {new Date(logro.unlocked_at).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )})}
          </div>

          {logros.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay logros disponibles todavía.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Logros;