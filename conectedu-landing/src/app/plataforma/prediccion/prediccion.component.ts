import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Usuarios } from '../../services/usuarios';

@Component({
  selector: 'app-prediccion',
  standalone: false,
  templateUrl: './prediccion.component.html',
  styleUrls: ['./prediccion.component.css']
})
export class PrediccionComponent implements OnInit {
  @Input() idAlumnoInput?: number;
  
  alumnos: any[] = [];
  alumnosFiltrados: any[] = [];
  
  resultadosIA: { [id: number]: any } = {};
  cargandoID: number | null = null;
  evaluandoEnLote: boolean = false;

  // Modal State
  modalAbierto: boolean = false;
  alumnoSeleccionado: any = null;
  datosEstadisticos: any = null;

  resultadoIndividual: any = null;

  constructor(private usuariosService: Usuarios, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    if (!this.idAlumnoInput) {
      this.cargarAlumnos();
    } else {
      this.ejecutarModelo(this.idAlumnoInput);
    }
  }

  cargarAlumnos() {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.alumnos = usuarios.filter((u: any) => u.nombre_rol === 'estudiante');
        this.alumnosFiltrados = [...this.alumnos];
        
        // Disparar autoevaluación silenciosa
        this.evaluarTodosEnLote();
      },
      error: (err) => console.error('Error cargando la lista de alumnos:', err)
    });
  }

  filtrarAlumnos(event: Event) {
    const target = event.target as HTMLInputElement;
    const termino = target.value.toLowerCase();
    if (!termino) {
      this.alumnosFiltrados = [...this.alumnos];
      return;
    }
    this.alumnosFiltrados = this.alumnos.filter(a => 
      a.nombre_completo.toLowerCase().includes(termino) ||
      a.email.toLowerCase().includes(termino) ||
      a.id_usuario.toString().includes(termino)
    );
  }

  async evaluarTodosEnLote() {
    this.evaluandoEnLote = true;
    for (const alumno of this.alumnos) {
      if (!this.resultadosIA[alumno.id_usuario]) {
        await this.evaluarAlumnoPromise(alumno.id_usuario);
        // Delay para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    this.evaluandoEnLote = false;
  }

  evaluarAlumnoPromise(idAlumno: number): Promise<void> {
    return new Promise((resolve) => {
      this.usuariosService.evaluarRiesgoIA(idAlumno).subscribe({
        next: (respuesta) => {
          this.resultadosIA = { ...this.resultadosIA, [idAlumno]: respuesta };
          this.cdr.detectChanges();
          resolve();
        },
        error: (err) => {
          this.resultadosIA = { ...this.resultadosIA, [idAlumno]: { error: 'Error de IA' } };
          this.cdr.detectChanges();
          resolve();
        }
      });
    });
  }

  ejecutarModelo(id: string | number) {
    const idAlumno = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(idAlumno) || !idAlumno) return;
    
    // Si ya está evaluado y queremos ver detalles (modo general)
    if (!this.idAlumnoInput && this.resultadosIA[idAlumno] && !this.resultadosIA[idAlumno].error) {
      this.abrirModal(this.alumnos.find(a => a.id_usuario === idAlumno));
      return;
    }

    this.cargandoID = idAlumno;
    
    this.usuariosService.evaluarRiesgoIA(idAlumno).subscribe({
      next: (respuesta) => {
        if (this.idAlumnoInput) {
          this.resultadoIndividual = respuesta;
        } else {
          this.resultadosIA = { ...this.resultadosIA, [idAlumno]: respuesta };
          this.abrirModal(this.alumnos.find(a => a.id_usuario === idAlumno));
        }
        this.cargandoID = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const errorMsg = { error: 'Ocurrió un error al consultar el modelo.' };
        if (this.idAlumnoInput) {
          this.resultadoIndividual = errorMsg;
        } else {
          this.resultadosIA = { ...this.resultadosIA, [idAlumno]: errorMsg };
        }
        this.cargandoID = null;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal(alumno: any) {
    if (!alumno) return;
    this.alumnoSeleccionado = alumno;
    
    const resultado = this.resultadosIA[alumno.id_usuario];
    if (resultado && !resultado.error && resultado.datos_alumno) {
        this.datosEstadisticos = resultado;
    } else {
        this.datosEstadisticos = null;
    }
    
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    setTimeout(() => {
      this.alumnoSeleccionado = null;
      this.datosEstadisticos = null;
    }, 300);
  }
}
