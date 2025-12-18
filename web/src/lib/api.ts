const API_URL = 'http://localhost/api';

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const peticionApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  // Si el body es FormData, NO establecer Content-Type (el navegador lo hace automáticamente)
  const isFormData = options.body instanceof FormData;
  
  const headers: HeadersInit = {
    ...options.headers,
  };
  
  // Solo establecer Content-Type si NO es FormData
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Añadir autorización si hay
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Enviar la petición a la API
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch (e) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    // Si hay errores de validación, mostrar el primer error
    if (error.errors) {
      const firstError = Object.values(error.errors)[0];
      const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      throw new Error(errorMessage || error.message || 'Error en la petición');
    }
    
    throw new Error(error.message || 'Error en la petición');
  }

  return response.json();
};
