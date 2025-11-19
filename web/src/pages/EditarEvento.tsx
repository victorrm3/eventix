import { useState, useEffect } from "react";
import Navigation from "@/components/Navegacion";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
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
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost/api'}/events/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar el evento");
        }

        const evento = await response.json();
        
        setFormData({
          title: evento.title || "",
          description: evento.description || "",
          date: evento.date || "",
          time: evento.time || "",
          location: evento.location || "",
          lat: evento.lat?.toString() || "",
          lng: evento.lng?.toString() || "",
          capacity: evento.capacity?.toString() || "",
          category: evento.category || "",
          price: evento.price?.toString() || "",
          shareable: evento.shareable || false,
          image: null,
          currentImageUrl: evento.image || "",
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

    cargarEvento();
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

  // Geocoding automático usando Nominatim (OpenStreetMap)
  const handleGeocoding = async () => {
    if (!formData.location.trim()) {
      toast.error("Por favor, introduce una dirección");
      return;
    }

    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(data[0].lat).toFixed(8),
          lng: parseFloat(data[0].lon).toFixed(8),
        }));
        toast.success("Coordenadas obtenidas correctamente");
      } else {
        toast.error("No se encontraron coordenadas para esta dirección");
      }
    } catch (error) {
      toast.error("Error al obtener coordenadas");
      console.error(error);
    } finally {
      setGeocoding(false);
    }
  };

  // Manejar selección de ubicación en el mapa
  const handleMapLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      lat: lat.toFixed(8),
      lng: lng.toFixed(8),
    }));
    toast.success("Ubicación actualizada desde el mapa");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.capacity) {
      toast.error("Por favor, completa todos los campos obligatorios");
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("lat", formData.lat || "0");
      formDataToSend.append("lng", formData.lng || "0");
      formDataToSend.append("capacity", formData.capacity);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price || "0");
      formDataToSend.append("shareable", formData.shareable ? "1" : "0");
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost/api'}/events/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el evento");
      }

      toast.success("Evento actualizado correctamente");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el evento");
    } finally {
      setLoading(false);
    }
  };

  if (loadingEvento) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground">Cargando evento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Cabecera */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">Editar Evento</h1>
            <p className="text-muted-foreground">Modifica los detalles del evento</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-foreground">Información del Evento</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Título */}
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                    Título del Evento *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Introduce el título del evento"
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe el evento"
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Fecha */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fecha del Evento *
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Hora */}
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-foreground mb-2">
                    Hora *
                  </label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Ubicación */}
                <div className="md:col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ubicación *
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="location"
                      name="location"
                      type="text"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Dirección del evento"
                      className="flex-1 px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleGeocoding}
                      disabled={geocoding}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50"
                    >
                      {geocoding ? "Buscando..." : "Geocodificar"}
                    </button>
                  </div>
                </div>

                {/* Coordenadas */}
                <div>
                  <label htmlFor="lat" className="block text-sm font-medium text-foreground mb-2">
                    Latitud
                  </label>
                  <input
                    id="lat"
                    name="lat"
                    type="text"
                    value={formData.lat}
                    onChange={handleInputChange}
                    placeholder="38.3452343"
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="lng" className="block text-sm font-medium text-foreground mb-2">
                    Longitud
                  </label>
                  <input
                    id="lng"
                    name="lng"
                    type="text"
                    value={formData.lng}
                    onChange={handleInputChange}
                    placeholder="-0.4810435"
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Mapa */}
                {showMap && formData.lat && formData.lng && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Ubicación en el mapa (haz clic para actualizar)
                    </label>
                    <div className="h-64 rounded-md overflow-hidden border border-border">
                      <MapContainer
                        center={[parseFloat(formData.lat), parseFloat(formData.lng)]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[parseFloat(formData.lat), parseFloat(formData.lng)]} />
                        <MapClickHandler onLocationSelect={handleMapLocationSelect} />
                      </MapContainer>
                    </div>
                  </div>
                )}

                {/* Capacidad */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Capacidad *
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Número máximo de asistentes"
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Categoría
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="concierto">Concierto</option>
                    <option value="conferencia">Conferencia</option>
                    <option value="festival">Festival</option>
                    <option value="deportivo">Deportivo</option>
                    <option value="cultural">Cultural</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Precio */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Precio (€)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Compartible */}
                <div className="flex items-center gap-2">
                  <input
                    id="shareable"
                    name="shareable"
                    type="checkbox"
                    checked={formData.shareable}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <label htmlFor="shareable" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Entrada compartible
                  </label>
                </div>
              </div>
            </div>

            {/* Imagen */}
            <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Imagen del Evento
              </h2>
              
              {formData.currentImageUrl && !formData.image && (
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
                <label htmlFor="image" className="block text-sm font-medium text-foreground mb-2">
                  {formData.currentImageUrl ? "Nueva imagen (opcional)" : "Imagen del evento"}
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {formData.image && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nueva imagen seleccionada: {formData.image.name}
                  </p>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Actualizando..." : "Actualizar Evento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarEvento;