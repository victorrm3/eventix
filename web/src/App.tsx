import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Eventos from "./pages/Eventos";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PanelAdministrador from "./pages/PanelAdministrador";
import DetalleEvento from "./pages/DetalleEvento";
import CrearEvento from "./pages/CrearEvento";
import CrearEventoAdmin from "./pages/CrearEventoAdmin";
import SaberMas from "./pages/SaberMas";
import MiPerfil from "./pages/MiPerfil";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<PanelAdministrador />} />
          <Route path="/admin/crear-evento" element={<CrearEventoAdmin />} />
          <Route path="/crear-evento" element={<CrearEvento />} />
          <Route path="/saber-mas" element={<SaberMas />} />
          <Route path="/mi-perfil" element={<MiPerfil />} />
          <Route path="/event/:id" element={<DetalleEvento />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
