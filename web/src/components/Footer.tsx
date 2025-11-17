import { Link } from "react-router-dom";
import { Mail, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
import logoEventix from "@/assets/logoeventixtrans.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img 
                src={logoEventix} 
                alt="EVENTIX" 
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm">
              Descubre y crea experiencias inolvidables. La plataforma líder para eventos.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/eventos" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Eventos
                </Link>
              </li>
              <li>
                <Link to="/crear-evento" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Crear Evento
                </Link>
              </li>
              <li>
                <Link to="/saber-mas" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Saber Más
                </Link>
              </li>
              <li>
                <Link to="/mi-perfil" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400 text-sm">
                <Mail className="w-4 h-4 mr-2" />
                admin@eventix.com
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                Alicante, España
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} EVENTIX. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
