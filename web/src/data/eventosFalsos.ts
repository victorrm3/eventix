import eventoConcierto from "@/assets/evento-concierto.jpg";
import eventoConferencia from "@/assets/evento-conferencia.jpg";
import eventoFestival from "@/assets/evento-festival.jpg";

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  precio: number;
  imagen: string;
  personas: number;
  maxPersonas: number;
}

export const eventosFalsos: Evento[] = [
  {
    id: '1',
    titulo: 'Festival de Música de Verano 2024',
    descripcion: 'Únete a nosotros para una noche inolvidable de música en vivo con los mejores artistas de todo el mundo. Vive actuaciones increíbles bajo las estrellas.',
    fecha: '15 de julio, 2024',
    hora: '19:00',
    lugar: 'Anfiteatro del Parque Central',
    precio: 89,
    imagen: eventoConcierto,
    personas: 1250,
    maxPersonas: 2000,
  },
  {
    id: '2',
    titulo: 'Conferencia de Innovación Tecnológica',
    descripcion: 'Descubre las últimas tendencias en tecnología, IA e innovación. Conecta con líderes de la industria y aprende de oradores expertos.',
    fecha: '22 de agosto, 2024',
    hora: '9:00',
    lugar: 'Centro de Convenciones del Centro',
    precio: 299,
    imagen: eventoConferencia,
    personas: 845,
    maxPersonas: 1000,
  },
  {
    id: '3',
    titulo: 'Festival Internacional de Comida',
    descripcion: 'Prueba cocinas de todo el mundo en este vibrante festival gastronómico. Evento familiar con demostraciones de cocina en vivo.',
    fecha: '5 de septiembre, 2024',
    hora: '11:00',
    lugar: 'Parque Riverside',
    precio: 25,
    imagen: eventoFestival,
    personas: 567,
    maxPersonas: 1500,
  },
  {
    id: '4',
    titulo: 'Noche de Jazz en Blue Note',
    descripcion: 'Una velada íntima de jazz suave con músicos reconocidos. Perfecto para una noche sofisticada.',
    fecha: '28 de julio, 2024',
    hora: '20:30',
    lugar: 'Blue Note Jazz Club',
    precio: 65,
    imagen: eventoConcierto,
    personas: 156,
    maxPersonas: 200,
  },
  {
    id: '5',
    titulo: 'Competición de Startups',
    descripcion: 'Observa cómo startups innovadoras compiten por financiación. Conecta con emprendedores e inversores.',
    fecha: '10 de agosto, 2024',
    hora: '14:00',
    lugar: 'Centro de Innovación',
    precio: 0,
    imagen: eventoConferencia,
    personas: 234,
    maxPersonas: 300,
  },
  {
    id: '6',
    titulo: 'Cata de Vinos y Quesos',
    descripcion: 'Descubre vinos exquisitos maridados con quesos artesanales. Aprende de expertos sommeliers.',
    fecha: '20 de julio, 2024',
    hora: '18:00',
    lugar: 'Terraza del Viñedo',
    precio: 125,
    imagen: eventoFestival,
    personas: 89,
    maxPersonas: 150,
  },
];

export const getEventosDestacados = () => eventosFalsos.slice(0, 3);
export const getAllEventos = () => eventosFalsos;