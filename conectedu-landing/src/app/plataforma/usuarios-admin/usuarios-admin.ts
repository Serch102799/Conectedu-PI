import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuarios } from '../../services/usuarios';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios-admin',
  standalone: false,
  templateUrl: './usuarios-admin.html',
  styleUrls: ['./usuarios-admin.css']
})
export class UsuariosAdminComponent implements OnInit {
  usuarios: any[] = [];
  usuarioForm: FormGroup;
  editandoId: number | null = null; // Para saber si estamos creando o editando

  constructor(private fb: FormBuilder, private usuariosService: Usuarios, private cdr: ChangeDetectorRef) {
    this.usuarioForm = this.fb.group({
      id_rol: ['', Validators.required],
      nombre_completo: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''] // Es opcional al editar
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = [...data];
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error al cargar', err)
    });
  }
  guardarUsuario() {
    // Validación inicial
    if (this.usuarioForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, llena todos los campos obligatorios.',
        confirmButtonColor: '#004b93'
      });
      return;
    }

    const accionTexto = this.editandoId ? 'actualizar' : 'crear';

    // Confirmación antes de enviar a la base de datos
    Swal.fire({
      title: `¿Confirmas ${accionTexto} este usuario?`,
      text: "Revisa que los datos y el rol sean correctos.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#004b93',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${accionTexto}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      
      if (result.isConfirmed) {
        if (this.editandoId) {
          // ACTUALIZAR
          this.usuariosService.actualizarUsuario(this.editandoId, this.usuarioForm.value).subscribe({
            next: () => {
              this.cargarUsuarios();
              this.cancelarEdicion();
              Swal.fire('¡Actualizado!', 'El usuario ha sido modificado con éxito.', 'success');
            },
            error: (err) => {
              Swal.fire('Error', err.error.mensaje || 'No se pudo actualizar al usuario.', 'error');
            }
          });
        } else {
          // CREAR
          this.usuariosService.crearUsuario(this.usuarioForm.value).subscribe({
            next: () => {
              this.cargarUsuarios();
              this.usuarioForm.reset();
              Swal.fire('¡Creado!', 'El usuario se registró correctamente en el sistema.', 'success');
            },
            error: (err) => {
              Swal.fire('Error', err.error.mensaje || 'Error al crear el usuario. ¿Quizás el correo ya existe?', 'error');
            }
          });
        }
      }
    });
  }

  editarUsuario(usuario: any) {
    this.editandoId = usuario.id_usuario;
    this.usuarioForm.patchValue({
      id_rol: usuario.nombre_rol === 'admin' ? 1 : usuario.nombre_rol === 'tutor' ? 2 : 3, // Mapeo simple
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      password: '' // Ocultamos el password por seguridad
    });
  }

  eliminarUsuario(id: number) {
    // Alerta roja de peligro
    Swal.fire({
      title: '¿Estás completamente seguro?',
      text: "Esta acción eliminará el acceso del usuario a la plataforma y no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      
      if (result.isConfirmed) {
        this.usuariosService.eliminarUsuario(id).subscribe({
          next: () => {
            this.cargarUsuarios();
            Swal.fire('¡Eliminado!', 'El usuario ha sido dado de baja del sistema.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', err.error.mensaje || 'Hubo un problema al eliminar. Verifica dependencias.', 'error');
          }
        });
      }
    });
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.usuarioForm.reset();
  }

  aprobarUsuario(usuario: any) {
    Swal.fire({
      title: '¿Aprobar solicitud de registro?',
      text: `¿Estás seguro de que quieres aprobar a ${usuario.nombre_completo}? Esto le dará acceso a la plataforma.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuariosService.aprobarUsuario(usuario.id_usuario).subscribe({
          next: () => {
            this.cargarUsuarios();
            Swal.fire('¡Aprobado!', 'El usuario ahora tiene acceso a la plataforma.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', err.error?.mensaje || 'Hubo un problema al aprobar.', 'error');
          }
        });
      }
    });
  }
}