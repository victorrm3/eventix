import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatea fecha de YYYY-MM-DD a DD-MM-YYYY
export function formatearFecha(fechaISO: string): string {
  const [year, month, day] = fechaISO.split('-');
  return `${day}-${month}-${year}`;
}

// Verifica si un evento es futuro (fecha >= hoy)
export function esEventoFuturo(fechaISO: string): boolean {
  // Parsear manualmente para evitar problemas de zona horaria
  const [year, month, day] = fechaISO.split('-').map(Number);
  const fechaEvento = new Date(year, month - 1, day);
  const hoy = new Date();
  
  // Normalizar ambas fechas a medianoche en hora local
  hoy.setHours(0, 0, 0, 0);
  fechaEvento.setHours(0, 0, 0, 0);
  
  // Comparar timestamps para evitar problemas de zona horaria
  return fechaEvento.getTime() >= hoy.getTime();
}