import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.html',
  styleUrls: ['./test.css']
})
export class Test{
  // Estado de la vista
  vistaActual: 'lista' | 'examen' | 'resultados' = 'lista';
  
  // Datos del examen activo
  preguntaActualIndex: number = 0;
  puntaje: number = 0;
  respuestaSeleccionada: string = '';

  // 1. Lista de exámenes disponibles
  examenesPendientes = [
    { id: 1, titulo: 'Diagnóstico de Matemáticas', materia: 'Matemáticas', tiempo: '15 min', preguntas: 3, icono: '📐' },
    { id: 2, titulo: 'Cuestionario de Historia', materia: 'Historia', tiempo: '20 min', preguntas: 5, icono: '🏛️' }
  ];

  // 2. Preguntas simuladas para el examen ID 1
  preguntasSimuladas = [
    { 
      pregunta: '¿Cuál es el resultado de la operación: 5 + 3 x 2?', 
      opciones: ['16', '11', '10', '15'], 
      respuestaCorrecta: '11' 
    },
    { 
      pregunta: 'Si x + 4 = 10, ¿cuál es el valor de x?', 
      opciones: ['4', '5', '6', '14'], 
      respuestaCorrecta: '6' 
    },
    { 
      pregunta: '¿Cuál es el área de un cuadrado si uno de sus lados mide 4 cm?', 
      opciones: ['8 cm²', '12 cm²', '16 cm²', '20 cm²'], 
      respuestaCorrecta: '16 cm²' 
    }
  ];

  // Métodos de interacción
  comenzarExamen(id: number) {
    if (id === 1) { // Solo tenemos simulado el examen 1 por ahora
      this.vistaActual = 'examen';
      this.preguntaActualIndex = 0;
      this.puntaje = 0;
      this.respuestaSeleccionada = '';
    } else {
      alert('Este examen aún no está disponible en la versión de demostración.');
    }
  }

  seleccionarOpcion(opcion: string) {
    this.respuestaSeleccionada = opcion;
  }

  siguientePregunta() {
    // Validar si es correcta
    if (this.respuestaSeleccionada === this.preguntasSimuladas[this.preguntaActualIndex].respuestaCorrecta) {
      this.puntaje++;
    }

    // Avanzar o terminar
    if (this.preguntaActualIndex < this.preguntasSimuladas.length - 1) {
      this.preguntaActualIndex++;
      this.respuestaSeleccionada = ''; // Limpiar selección
    } else {
      this.vistaActual = 'resultados';
    }
  }

  volverAlInicio() {
    this.vistaActual = 'lista';
  }
}