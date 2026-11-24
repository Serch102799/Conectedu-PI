import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CursosService } from '../../services/cursos';
import { Usuarios } from '../../services/usuarios';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cursos',
  standalone: false,
  templateUrl: './cursos.html',
  styleUrls: ['./cursos.css'] // <-- Usa el mismo CSS que usuarios-admin.component.css
})
export class Cursos implements OnInit {
  cursos: any[] = [];
  tutores: any[] = []; // Para llenar el select de profesores
  cursoForm: FormGroup;
  editandoId: number | null = null;
  rolUsuario: string = '';

  constructor(
    private fb: FormBuilder, 
    private cursosService: CursosService,
    private usuariosService: Usuarios,
    private cdr: ChangeDetectorRef
  ) {
    this.cursoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      id_tutor: [''],
      estado: [true]
    });
  }

  ngOnInit(): void {
    this.rolUsuario = localStorage.getItem('usuario_rol') || 'estudiante';
    this.cargarCursos();
    
    // Solo el administrador necesita cargar los tutores para asignarlos
    if (this.rolUsuario === 'admin') {
      this.usuariosService.getTutores().subscribe({
        next: (data) => this.tutores = data,
        error: (err) => console.error('Error al cargar la lista de tutores', err)
      });
    }
  }

  cargarCursos() {
    this.cursosService.getCursos().subscribe({
      next: (data) => {
        this.cursos = [...data]; 
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error al cargar', err)
    });
  }

  cargarTutores() {
    if (this.rolUsuario === 'admin') {
      this.usuariosService.getUsuarios().subscribe(data => {
        this.tutores = data.filter((u: any) => u.nombre_rol === 'tutor');
      });
    }
  }

  guardarCurso() {
    // Si el formulario está incompleto, lanzamos un modal de advertencia
    if (this.cursoForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, llena todos los campos obligatorios antes de continuar.',
        confirmButtonColor: '#004b93'
      });
      return;
    }

    const accionTexto = this.editandoId ? 'actualizar' : 'crear';

    // 2. MODAL DE CONFIRMACIÓN ANTES DE GUARDAR
    Swal.fire({
      title: `¿Confirmas ${accionTexto} este curso?`,
      text: "Revisa que la información sea correcta.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#004b93',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${accionTexto}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      
      // Si el usuario presiona "Sí"...
      if (result.isConfirmed) {
        
        if (this.editandoId) {
          // LÓGICA DE ACTUALIZAR
          this.cursosService.actualizarCurso(this.editandoId, this.cursoForm.value).subscribe({
            next: () => {
              this.cargarCursos();
              this.cancelarEdicion();
              Swal.fire('¡Actualizado!', 'El curso ha sido modificado con éxito.', 'success'); // Notificación de éxito
            },
            error: (err) => {
              Swal.fire('Error', err.error.mensaje || 'No se pudo actualizar.', 'error'); // Notificación de error
            }
          });
        } else {
          // LÓGICA DE CREAR
          this.cursosService.crearCurso(this.cursoForm.value).subscribe({
            next: () => {
              this.cargarCursos();
              this.cursoForm.reset({ estado: true });
              Swal.fire('¡Creado!', 'La materia se registró correctamente en el sistema.', 'success');
            },
            error: (err) => {
              Swal.fire('Error', err.error.mensaje || 'No se pudo crear la materia.', 'error');
            }
          });
        }
      }
    });
  }

  eliminarCurso(id: number) {
    // 3. MODAL DE CONFIRMACIÓN EN ROJO ANTES DE ELIMINAR
    Swal.fire({
      title: '¿Estás completamente seguro?',
      text: "Esta acción no se puede deshacer. Podrías afectar a los alumnos inscritos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f', // Rojo para peligro
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      
      if (result.isConfirmed) {
        this.cursosService.eliminarCurso(id).subscribe({
          next: () => {
            this.cargarCursos();
            Swal.fire('¡Eliminado!', 'El curso desapareció del catálogo.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', err.error.mensaje || 'Hubo un problema al eliminar. Verifica dependencias.', 'error');
          }
        });
      }
    });
  }

  editarCurso(curso: any) {
    this.editandoId = curso.id_curso;
    this.cursoForm.patchValue(curso);
  }


  cancelarEdicion() {
    this.editandoId = null;
    this.cursoForm.reset({ estado: true });
  }
}