import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navegacion from "@/components/Navegacion";
import { Star } from "lucide-react";
import { peticionApi } from "@/lib/api";
import { toast } from "sonner";

// Página para escribir una reseña de un evento.
// Comentarios hasta el `return`: estados, validaciones y envío de la reseña.
const EscribirResena = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // `rating`: puntuación seleccionada (1-5). `hoverRating` al pasar el ratón.
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Maneja el envío del formulario: valida y llama al endpoint de reviews
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Comprobación básica: debe existir un `eventId` en la ruta
    if (!eventId) {
      toast.error("Evento no válido");
      return;
    }

    // Validación: el usuario debe seleccionar al menos una estrella
    if (rating === 0) {
      toast.error("Por favor selecciona una puntuación");
      return;
    }

    try {
      setLoading(true);

      // Enviar la reseña al backend. `peticionApi` abstrae headers y baseURL.
      await peticionApi(`/events/${eventId}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      toast.success("Reseña enviada correctamente");
      navigate(-1);
    } catch (error: any) {
      toast.error(error.message || "Error al enviar la reseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navegacion />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Escribir Reseña</h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm p-6">
            {/* Sistema de estrellas */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-3">Puntuación</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {rating > 0 ? `Has seleccionado ${rating} de 5 estrellas` : "Selecciona una puntuación"}
              </p>
            </div>

            {/* Textarea para el comentario */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-lg font-semibold mb-3">
                Tu comentario
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe tu opinión sobre el evento..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar Reseña"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EscribirResena;