import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const ruta = useLocation();

  useEffect(() => {
    console.error("Error 404: El usuario ha tratado de acceder a una ruta inexistente:", ruta.pathname);
  }, [ruta.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Página no encontrada</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Volver a la página principal
        </a>
      </div>
    </div>
  );
};

export default NotFound;
