import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificacionesService } from '../../services/notificaciones.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  nombreUsuario: string = '';
  rolUsuario: string = '';

  isSidebarCollapsed: boolean = false;
  
  notificaciones: any[] = [];
  notificacionesNoLeidas: number = 0;
  isDropdownOpen: boolean = false;

  // Estado del Modal Triste de Cierre de Sesión
  mostrarModalLogout: boolean = false;

  constructor(
    private router: Router, 
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit() {
    this.nombreUsuario = localStorage.getItem('usuario_nombre') || 'Usuario';
    this.rolUsuario = localStorage.getItem('usuario_rol') || 'Invitado';
    this.cargarNotificaciones();
  }

  cargarNotificaciones() {
    this.notificacionesService.getNotificaciones().subscribe({
      next: (data) => {
        this.notificaciones = data;
        this.notificacionesNoLeidas = this.notificaciones.filter(n => !n.leida).length;
      },
      error: (err) => console.error('Error al revisar notificaciones', err)
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  marcarLeidaYRedirigir(notif: any) {
    if (!notif.leida) {
      this.notificacionesService.marcarComoLeida(notif.id_notificacion).subscribe({
        next: () => {
          notif.leida = true;
          this.notificacionesNoLeidas = this.notificaciones.filter(n => !n.leida).length;
        }
      });
    }
    
    this.isDropdownOpen = false;
    if (notif.enlace) {
      this.router.navigate([notif.enlace]);
    }
  }

  // En lugar de cerrar de golpe, abrimos el modal
  intentarCerrarSesion() {
    this.mostrarModalLogout = true;
  }

  cancelarCierreSesion() {
    this.mostrarModalLogout = false;
  }

  confirmarCierreSesion() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
  
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
