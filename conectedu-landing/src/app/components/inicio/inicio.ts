import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio implements OnInit, OnDestroy {
  // Arreglo con los mensajes de nuestro carrusel
  slides = [
    {
      titulo: 'Transformando',
      resaltado: 'El Futuro.',
      descripcion: 'Erradicando la deserción escolar en Córdoba mediante tecnología inmersiva y acompañamiento inteligente.',
      imagen: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      titulo: 'Educación',
      resaltado: 'Sin Límites.',
      descripcion: 'Conectamos alumnos, padres y profesores en una red de apoyo sólida, accesible en cualquier momento.',
      imagen: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      titulo: 'Acompañamiento',
      resaltado: 'Personalizado.',
      descripcion: 'Monitoreo continuo y tutorías 1 a 1 adaptadas a tu propio ritmo de aprendizaje.',
      imagen: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  currentSlide = 0;
  slideInterval: any;

  ngOnInit() {
    // Inicia el carrusel automático (cambia cada 5 segundos)
    this.iniciarCarrusel();
  }

  ngOnDestroy() {
    // Limpiamos el intervalo si cambiamos de página
    this.detenerCarrusel();
  }

  iniciarCarrusel() {
    this.slideInterval = setInterval(() => {
      this.siguienteSlide();
    }, 5000);
  }

  detenerCarrusel() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  siguienteSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  // Permite al usuario hacer clic en un indicador para cambiar de diapositiva
  setSlide(index: number) {
    this.currentSlide = index;
    this.detenerCarrusel();
    this.iniciarCarrusel(); // Reinicia el contador
  }
}