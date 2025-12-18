import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navegacion from "@/components/Navegacion";
import { Star } from "lucide-react";
import { peticionApi } from "@/lib/api";
import { toast } from "sonner";

interface Review {
  id: number;
  user: {
    id: number;
    name: string;
    profile_image?: string | null;
  };
  rating: number;
  comment: string | null;
  created_at: string;
}

const ResenasEvento = () => {
  const { eventId } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        const data = await peticionApi(`/events/${eventId}/reviews`);
        setReviews(data.reviews || []);
        setAverageRating(data.average_rating ?? null);
        setTotalReviews(data.total_reviews ?? 0);
      } catch (error: any) {
        console.error("Error al cargar reseñas:", error);
        toast.error(error.message || "Error al cargar reseñas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [eventId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navegacion />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Reseñas del Evento</h1>
          
          {/* Resumen */}
          {totalReviews > 0 && (
            <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-purple-600">
                  {averageRating !== null ? averageRating.toFixed(1) : "-"}
                </div>
                <div>
                  {renderStars(averageRating ? Math.round(averageRating) : 0)}
                  <p className="text-sm text-gray-500 mt-1">
                    {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de reseñas */}
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-gray-500 text-center py-8">
                Cargando reseñas, por favor espera...
              </p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aún no hay reseñas para este evento.
              </p>
            ) : (
              reviews.map((resena) => {
                const formattedDate = new Date(resena.created_at).toLocaleDateString("es-ES");

                return (
                  <div key={resena.id} className="bg-white rounded-lg border shadow-sm p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {resena.user?.profile_image ? (
                            <img
                              src={resena.user.profile_image}
                              alt={resena.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-600">
                              {resena.user?.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{resena.user?.name ?? "Usuario"}</p>
                          <p className="text-sm text-gray-500">{formattedDate}</p>
                        </div>
                      </div>
                      {renderStars(resena.rating)}
                    </div>
                    {resena.comment && (
                      <p className="text-gray-700">{resena.comment}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResenasEvento;