import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TutoriasService } from '../../services/tutorias.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-panel-tutor',
  standalone: false,
  templateUrl: './panel-tutor.component.html',
  styleUrls: ['./panel-tutor.component.css']
})
export class PanelTutorComponent implements OnInit {
  perfilForm: FormGroup;
  horarios: any[] = [];
  miId: number;

  constructor(
    private fb: FormBuilder,
    private tutoriasService: TutoriasService,
    private cdr: ChangeDetectorRef
  ) {
    // Obtenemos el ID del tutor logueado
    this.miId = parseInt(localStorage.getItem('usuario_id') || '0');
    
    this.perfilForm = this.fb.group({
      especialidad: ['', Validators.required],
      biografia: ['', Validators.required],
      enlace_reunion: ['']
    });
  }

  ngOnInit(): void {
    this.cargarMiPerfil();
    this.cargarMisHorarios();
  }

  cargarMiPerfil() {
    // Buscamos nuestro propio perfil en la lista pública
    this.tutoriasService.getTutoresPublicos().subscribe(data => {
      const miPerfil = data.find((t: any) => t.id_usuario === this.miId);
      if (miPerfil) {
        this.perfilForm.patchValue({
          especialidad: miPerfil.especialidad || '',
          biografia: miPerfil.biografia || '',
          enlace_reunion: miPerfil.enlace_reunion || ''
        });
      }
    });
  }

  guardarPerfil() {
    if (this.perfilForm.invalid) {
      Swal.fire('Faltan datos', 'Por favor completa tu especialidad y biografía', 'warning');
      return;
    }

    this.tutoriasService.actualizarMiPerfil(this.perfilForm.value).subscribe({
      next: () => Swal.fire('¡Actualizado!', 'Tu perfil público ha sido guardado con éxito.', 'success'),
      error: () => Swal.fire('Error', 'No pudimos guardar tu perfil.', 'error')
    });
  }

  cargarMisHorarios() {
    this.tutoriasService.getDisponibilidadTutor(this.miId).subscribe(data => {
      this.horarios = [...data];
      this.cdr.detectChanges();
    });
  }

  abrirModalNuevoHorario() {
    Swal.fire({
      title: 'Agregar Disponibilidad',
      html: `
        <div style="text-align: left;">
          <label style="font-size: 14px; color: #333;">Día de la semana:</label>
          <select id="dia" class="swal2-select" style="display:flex; width:100%; margin-top:5px;">
            <option value="Lunes">Lunes</option><option value="Martes">Martes</option>
            <option value="Miércoles">Miércoles</option><option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option><option value="Sábado">Sábado</option>
          </select>
          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <div style="flex: 1;">
              <label style="font-size: 14px; color: #333;">Hora Inicio:</label>
              <input type="time" id="inicio" class="swal2-input" style="display:flex; width:100%; margin-top:5px;">
            </div>
            <div style="flex: 1;">
              <label style="font-size: 14px; color: #333;">Hora Fin:</label>
              <input type="time" id="fin" class="swal2-input" style="display:flex; width:100%; margin-top:5px;">
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Horario',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#004b93',
      preConfirm: () => {
        const dia = (document.getElementById('dia') as HTMLSelectElement).value;
        const inicio = (document.getElementById('inicio') as HTMLInputElement).value;
        const fin = (document.getElementById('fin') as HTMLInputElement).value;

        if (!inicio || !fin) {
          Swal.showValidationMessage('Debes seleccionar la hora de inicio y fin');
          return false;
        }
        return { dia_semana: dia, hora_inicio: inicio, hora_fin: fin };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.tutoriasService.agregarHorario(result.value).subscribe({
          next: () => {
            this.cargarMisHorarios();
            Swal.fire('¡Agregado!', 'El horario se añadió a tu agenda.', 'success');
          },
          error: () => Swal.fire('Error', 'No pudimos guardar el horario.', 'error')
        });
      }
    });
  }

  eliminarHorario(id: number) {
    Swal.fire({
      title: '¿Eliminar horario?',
      text: 'Los alumnos ya no podrán agendar citas en este bloque.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.tutoriasService.eliminarHorario(id).subscribe({
          next: () => {
            this.cargarMisHorarios();
            Swal.fire('¡Eliminado!', 'El horario ha sido borrado.', 'success');
          },
          error: () => Swal.fire('Error', 'No pudimos borrar el horario.', 'error')
        });
      }
    });
  }
}