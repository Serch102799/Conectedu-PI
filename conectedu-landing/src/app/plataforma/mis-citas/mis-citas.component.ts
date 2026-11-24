import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TutoriasService } from '../../services/tutorias.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-citas',
  standalone: false,
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.css']
})
export class MisCitasComponent implements OnInit {
  citas: any[] = [];
  miRol: string = '';

  constructor(
    private tutoriasService: TutoriasService,
    private cdr: ChangeDetectorRef
  ) {
    // Averiguamos si quien navega es 'estudiante' o 'tutor'
    this.miRol = localStorage.getItem('usuario_rol') || '';
  }

  ngOnInit(): void {
    this.cargarMisCitas();
  }

  cargarMisCitas() {
    this.tutoriasService.getMisCitas().subscribe({
      next: (data) => {
        this.citas = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar mis citas', err)
    });
  }

  actualizarEstado(idCita: number, nuevoEstado: string) {
    const accion = nuevoEstado === 'Cancelada' ? 'cancelar' : nuevoEstado === 'Aceptada' ? 'aceptar' : 'marcar como completada';
    const colorBoton = nuevoEstado === 'Cancelada' ? '#d32f2f' : '#28a745';

    Swal.fire({
      title: `¿Confirmas ${accion} esta cita?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: colorBoton,
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cerrar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.tutoriasService.cambiarEstadoCita(idCita, nuevoEstado).subscribe({
          next: () => {
            this.cargarMisCitas();
            Swal.fire('¡Actualizado!', `La cita ahora está: ${nuevoEstado}`, 'success');
          },
          error: (err) => Swal.fire('Error', 'No se pudo actualizar el estado', 'error')
        });
      }
    });
  }
}