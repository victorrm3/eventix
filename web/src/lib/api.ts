const API_URL = 'https://eventixs.es/api';

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
    const error = await response.json();
    throw new Error(error.message || 'Error en la petición');
  }

  return response.json();
};
