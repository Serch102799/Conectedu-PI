import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TutoriasService } from '../../services/tutorias.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tutorias-estudiante',
  standalone: false,
  templateUrl: './tutorias-estudiante.component.html',
  styleUrls: ['./tutorias-estudiante.component.css']
})
export class TutoriasEstudianteComponent implements OnInit {
  tutores: any[] = [];

  constructor(
    private tutoriasService: TutoriasService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarTutores();
  }

  cargarTutores() {
    this.tutoriasService.getTutoresPublicos().subscribe({
      next: (data) => {
        this.tutores = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar tutores', err)
    });
  }

  abrirModalAgendar(tutor: any) {
    Swal.fire({
      title: 'Consultando disponibilidad...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    this.tutoriasService.getDisponibilidadTutor(tutor.id_usuario).subscribe({
      next: (horarios) => {
        if (horarios.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin disponibilidad',
            text: 'Este tutor aún no ha registrado sus horarios en el sistema.',
            confirmButtonColor: '#004b93'
          });
          return;
        }
        let opcionesHorarios = horarios.map((h: any) => 
          `<option value="${h.hora_inicio}|${h.hora_fin}">${h.dia_semana} de ${h.hora_inicio} a ${h.hora_fin}</option>`
        ).join('');

        Swal.fire({
          title: `Agendar con ${tutor.nombre_completo}`,
          html: `
            <div style="text-align: left; font-size: 0.95rem;">
              <label style="font-weight: bold; color: #333;">1. Selecciona un horario base:</label>
              <select id="swal-horario" class="swal2-select" style="display: flex; width: 100%; max-width: 100%; margin: 5px 0 15px; font-size: 14px;">
                ${opcionesHorarios}
              </select>
              
              <label style="font-weight: bold; color: #333;">2. ¿En qué fecha será tu cita?</label>
              <input type="date" id="swal-fecha" class="swal2-input" style="display: flex; width: 100%; max-width: 100%; margin: 5px 0 15px; font-size: 14px;">
              
              <label style="font-weight: bold; color: #333;">3. ¿Qué tema necesitas repasar?</label>
              <textarea id="swal-tema" class="swal2-textarea" placeholder="Ej: Dudas con despejes matemáticos..." style="display: flex; width: 100%; max-width: 100%; margin: 5px 0; font-size: 14px;"></textarea>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Confirmar Cita',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#28a745',
          cancelButtonColor: '#6c757d',
          
          preConfirm: () => {
            const horarioVal = (document.getElementById('swal-horario') as HTMLSelectElement).value;
            const fecha = (document.getElementById('swal-fecha') as HTMLInputElement).value;
            const tema = (document.getElementById('swal-tema') as HTMLTextAreaElement).value;

            if (!horarioVal || !fecha || !tema) {
              Swal.showValidationMessage('Por favor completa todos los campos para agendar.');
              return false;
            }
            const [hora_inicio, hora_fin] = horarioVal.split('|');
            
            return {
              id_tutor: tutor.id_usuario,
              fecha_cita: fecha,
              hora_inicio: hora_inicio,
              hora_fin: hora_fin,
              tema_duda: tema
            };
          }
        }).then((result) => {
          if (result.isConfirmed && result.value) {
            this.guardarCita(result.value);
          }
        });
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudieron cargar los horarios del tutor.', 'error');
      }
    });
  }

  guardarCita(datosCita: any) {
    this.tutoriasService.agendarCita(datosCita).subscribe({
      next: (res) => {
        Swal.fire('¡Cita Agendada!', 'Tu tutoría ha sido registrada con éxito. ¡Prepara tus dudas!', 'success');
      },
      error: (err) => {
        Swal.fire('Aviso', err.error.mensaje || 'No se pudo agendar la cita.', 'warning');
      }
    });
  }
}