import { Component } from '@angular/core';

@Component({
  selector: 'app-foro',
  standalone: false,
  templateUrl: './foro.html',
  styleUrls: ['./foro.css']
})
export class Foro {
  // Simulamos los temas de discusión en la base de datos
  temasDiscusion = [
    {
      id: 1,
      titulo: '¿Alguien me puede explicar las ecuaciones de segundo grado?',
      autor: 'Carlos M.',
      fecha: 'Hace 2 horas',
      respuestas: 5,
      categoria: 'Matemáticas',
      colorTag: '#e74c3c' // Rojo
    },
    {
      id: 2,
      titulo: 'Grupo de estudio para el examen de Historia (Fin de semana)',
      autor: 'Ana Gómez',
      fecha: 'Ayer',
      respuestas: 12,
      categoria: 'Estudio Grupal',
      colorTag: '#9b59b6' // Morado
    },
    {
      id: 3,
      titulo: 'Técnicas de concentración (Material de apoyo)',
      autor: 'Mtra. Silvia (Tutoría)',
      fecha: 'Hace 3 días',
      respuestas: 8,
      categoria: 'Apoyo Psicológico',
      colorTag: '#2ecc71' // Verde
    },
    {
      id: 4,
      titulo: 'Duda sobre el proyecto final de Ciencias',
      autor: 'Luis P.',
      fecha: 'Hace 5 días',
      respuestas: 2,
      categoria: 'Ciencias',
      colorTag: '#3498db' // Azul
    }
  ];
}