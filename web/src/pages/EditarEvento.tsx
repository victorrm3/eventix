import { useState, useEffect } from "react";
import Navigation from "@/components/Navegacion";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { peticionApi } from "@/lib/api";
import { Calendar, MapPin, Users, DollarSign, Image as ImageIcon, Share2, Tag } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Componente para manejar clics en el mapa
const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const EditarEvento = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    lat: "",
    lng: "",
    capacity: "",
    category: "",
    price: "",
    shareable: false,
    image: null as File | null,
    currentImageUrl: "", // Para mostrar la imagen actual
  });

  // Cargar datos del evento
  useEffect(() => {
    const cargarEvento = async () => {
      try {
        setLoadingEvento(true);
        const data = await peticionApi(`/events/${id}`);
        
        // El backend devuelve { success: true, event: {...} }
        const evento = data.event || data;
        
        // Convertir la hora de HH:MM:SS o HH:MM a HH:MM para el input type="time"
        let horaFormateada = evento.time || "";
        if (horaFormateada && horaFormateada.length > 5) {
          horaFormateada = horaFormateada.substring(0, 5); // Cortar a HH:MM
        }
        
        setFormData({
          title: evento.title || "",
          description: evento.description || "",
          date: evento.date || "",
          time: horaFormateada,
          location: evento.location || "",
          lat: evento.lat?.toString() || "",
          lng: evento.lng?.toString() || "",
          capacity: evento.capacity?.toString() || "",
          category: evento.category || "",
          price: evento.price?.toString() || "",
          shareable: evento.shareable || false,
          image: null,
          currentImageUrl: evento.image_url || "",
        });

        if (evento.lat && evento.lng) {
          setShowMap(true);
        }
      } catch (error: any) {
        toast.error(error.message || "Error al cargar el evento");
        navigate("/admin");
      } finally {
        setLoadingEvento(false);
      }
    };

    if (id) {
      cargarEvento();
    }
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  // Mostrar mapa cuando hay coordenadas
  useEffect(() => {
    if (formData.lat && formData.lng) {
      setShowMap(true);
    }
  }, [formData.lat, formData.lng]);

  // Función para obtener coordenadas desde una dirección
  const handleGeocoding = async () => {
    if (!formData.location.trim()) {
      toast.error("Por favor ingresa una ubicación");
      return;
    }

    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(lat).toFixed(6),
          lng: parseFloat(lon).toFixed(6),
        }));
        toast.success("Coordenadas encontradas");
      } else {
        toast.error("No se encontraron coordenadas para esta ubicación");
      }
    } catch (error) {
      toast.error("Error al buscar las coordenadas");
    } finally {
      setGeocoding(false);
    }
  };

  // Función para manejar la selección en el mapa
  const handleMapLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }));
    toast.success("Ubicación actualizada en el mapa");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar los datos para enviar como JSON
      const dataToSend: any = {
        title: formData.title || "",
        description: formData.description || "",
        date: formData.date || "",
        time: formData.time || "",
        location: formData.location || "",
        lat: formData.lat || null,
        lng: formData.lng || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : 0,
        category: formData.category || null,
        price: formData.price ? parseFloat(formData.price) : 0,
        shareable: formData.shareable,
      };

      // Si hay una nueva imagen, necesitamos usar FormData
      if (formData.image) {
        const formDataToSend = new FormData();
        Object.keys(dataToSend).forEach(key => {
          if (dataToSend[key] !== null && dataToSend[key] !== undefined) {
            if (typeof dataToSend[key] === 'boolean') {
              formDataToSend.append(key, dataToSend[key] ? "1" : "0");
            } else {
              formDataToSend.append(key, dataToSend[key].toString());
            }
          }
        });
        formDataToSend.append("image", formData.image);

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://eventixs.es/api'}/events/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Error al actualizar el evento" }));
          throw new Error(errorData.message || "Error al actualizar el evento");
        }

        toast.success("Evento actualizado exitosamente");
        navigate("/admin");
      } else {
        // Si no hay imagen nueva, usar JSON (como dice la documentación)
        await peticionApi(`/events/${id}`, {
          method: "PUT",
          body: JSON.stringify(dataToSend),
        });

        toast.success("Evento actualizado exitosamente");
        navigate("/admin");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el evento");
    } finally {
      setLoading(false);
    }
  };

  if (loadingEvento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando evento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Editar Evento</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica del evento */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Información del Evento
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Título del evento *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Hora *
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Ubicación
                </h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Dirección del evento *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Ej: Calle Principal 123, Ciudad"
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGeocoding}
                      disabled={geocoding}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {geocoding ? "Buscando..." : "Buscar"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Latitud *
                    </label>
                    <input
                      type="text"
                      name="lat"
                      value={formData.lat}
                      onChange={handleInputChange}
                      placeholder="Ej: 40.416775"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Longitud *
                    </label>
                    <input
                      type="text"
                      name="lng"
                      value={formData.lng}
                      onChange={handleInputChange}
                      placeholder="Ej: -3.703790"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                {showMap && formData.lat && formData.lng && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Haz clic en el mapa para actualizar la ubicación
                    </p>
                    <div className="h-[300px] rounded-lg overflow-hidden border border-border">
                      <MapContainer
                        center={[parseFloat(formData.lat), parseFloat(formData.lng)]}
                        zoom={13}
                        className="h-full w-full"
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[parseFloat(formData.lat), parseFloat(formData.lng)]} />
                        <MapClickHandler onLocationSelect={handleMapLocationSelect} />
                      </MapContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Detalles del evento */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Detalles del Evento
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Capacidad *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Categoría *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      <option value="Concierto">Concierto</option>
                      <option value="Conferencia">Conferencia</option>
                      <option value="Festival">Festival</option>
                      <option value="Deportivo">Deportivo</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Precio *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="shareable"
                    name="shareable"
                    checked={formData.shareable}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="shareable" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Evento compartible (permite que otros usuarios compartan el evento)
                  </label>
                </div>
              </div>

              {/* Imagen del evento */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Imagen del Evento
                </h2>

                {formData.currentImageUrl && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Imagen actual:</p>
                    <img 
                      src={formData.currentImageUrl} 
                      alt="Imagen actual del evento" 
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cambiar imagen (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Si no seleccionas una nueva imagen, se mantendrá la imagen actual.
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="flex-1 px-6 py-3 rounded-lg border border-border bg-background text-foreground hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Actualizando..." : "Actualizar Evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarEvento;