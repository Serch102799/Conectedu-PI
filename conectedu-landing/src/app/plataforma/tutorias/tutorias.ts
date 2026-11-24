import { Component } from '@angular/core';

@Component({
  selector: 'app-tutorias',
  standalone: false,
  templateUrl: './tutorias.html',
  styleUrls: ['./tutorias.css']
})
export class Tutorias {
  // Datos simulados de los profesores disponibles en Córdoba
  tutores = [
    { 
      id: 1, 
      nombre: 'Mtra. Elena Valdez', 
      materia: 'Matemáticas y Física', 
      disponibilidad: 'Lunes y Miércoles (16:00 - 18:00)', 
      enfoque: 'Regularización paso a paso',
      avatar: '👩‍🏫',
      color: '#e74c3c'
    },
    { 
      id: 2, 
      nombre: 'Lic. Roberto Vargas', 
      materia: 'Historia y Civismo', 
      disponibilidad: 'Martes y Jueves (15:00 - 17:00)', 
      enfoque: 'Técnicas de estudio y memorización',
      avatar: '👨‍🏫',
      color: '#3498db'
    },
    { 
      id: 3, 
      nombre: 'Ing. Carmen Ruiz', 
      materia: 'Ciencias y Biología', 
      disponibilidad: 'Viernes (14:00 - 18:00)', 
      enfoque: 'Preparación para exámenes',
      avatar: '👩‍🔬',
      color: '#2ecc71'
    }
  ];

  agendar(tutor: any) {
    // En una app real, esto abriría un modal o enviaría datos al servidor Node.js/PostgreSQL
    alert(`¡Listo! Has solicitado una tutoría con ${tutor.nombre} para ${tutor.materia}. Te enviaremos un correo con el enlace de la sesión.`);
  }
}