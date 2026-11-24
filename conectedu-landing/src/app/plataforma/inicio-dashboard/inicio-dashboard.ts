import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TutoriasService } from '../../services/tutorias.service';

@Component({
  selector: 'app-inicio-dashboard',
  standalone: false,
  templateUrl: './inicio-dashboard.html',
  styleUrls: ['./inicio-dashboard.css']
})
export class InicioDashboard implements OnInit, OnDestroy {
  nombreAlumno: string = '';
  estiloVak: string = 'Por definir';
  progresoGeneral: number = 0; 
  
  stats: any[] = [];
  actividadesProximas: any[] = [];
  isLoading: boolean = true;
  
  // Modales
  mostrarBienvenida: boolean = false;
  mensajeBienvenida: string = '';
  emojiBienvenida: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private tutoriasService: TutoriasService
  ) {}

  ngOnInit() {
    const rolUsuario = localStorage.getItem('usuario_rol');
    
    if (rolUsuario === 'admin') {
      this.router.navigate(['/plataforma/usuarios']);
      return;
    } else if (rolUsuario === 'tutor') {
      this.router.navigate(['/plataforma/panel-tutor']);
      return;
    }

    // Lógica para Estudiante
    this.nombreAlumno = localStorage.getItem('usuario_nombre') || 'Estudiante';
    this.estiloVak = localStorage.getItem('usuario_vak') || 'Por definir';
    
    // Aplicar tema VAK al document body
    this.aplicarTemaVAK();

    // Comprobar si debemos mostrar la bienvenida (solo una vez por sesión)
    if (!sessionStorage.getItem('bienvenida_mostrada')) {
      this.prepararBienvenida();
    }

    this.cargarDatosReales();
  }

  ngOnDestroy() {
    // Limpiar el tema al salir del componente
    document.body.classList.remove('theme-visual', 'theme-auditivo', 'theme-kinestesico');
  }

  aplicarTemaVAK() {
    document.body.classList.remove('theme-visual', 'theme-auditivo', 'theme-kinestesico');
    const tema = this.estiloVak.toLowerCase();
    
    if (tema.includes('visual')) {
      document.body.classList.add('theme-visual');
    } else if (tema.includes('auditivo')) {
      document.body.classList.add('theme-auditivo');
    } else if (tema.includes('kinestésico') || tema.includes('kinestesico')) {
      document.body.classList.add('theme-kinestesico');
    } else {
      document.body.classList.add('theme-visual'); // Default
    }
  }

  prepararBienvenida() {
    const tema = this.estiloVak.toLowerCase();
    if (tema.includes('visual')) {
      this.mensajeBienvenida = '¡Mira todo lo que puedes lograr hoy! Abre bien los ojos al conocimiento.';
      this.emojiBienvenida = '👀✨';
    } else if (tema.includes('auditivo')) {
      this.mensajeBienvenida = 'Escucha tu propio ritmo y no dejes de aprender. Sintoniza tu éxito.';
      this.emojiBienvenida = '🎧🌟';
    } else if (tema.includes('kinestésico') || tema.includes('kinestesico')) {
      this.mensajeBienvenida = '¡Pon manos a la obra! Siente la experiencia de superarte cada día.';
      this.emojiBienvenida = '💪🔥';
    } else {
      this.mensajeBienvenida = '¡Qué alegría tenerte de vuelta! Sigue construyendo tu futuro.';
      this.emojiBienvenida = '🚀';
    }
    this.mostrarBienvenida = true;
  }

  cerrarBienvenida() {
    this.mostrarBienvenida = false;
    sessionStorage.setItem('bienvenida_mostrada', 'true');
  }

  cargarDatosReales() {
    const idUsuario = localStorage.getItem('usuario_id');
    const urlAPI = `http://localhost:3000/api/usuarios/${idUsuario}/dashboard-stats`;

    this.http.get<any>(urlAPI).subscribe({
      next: (data) => {
        this.progresoGeneral = data.progresoGeneral;
        this.actualizarStats(data.rachaActual, data.promedio, data.citasPendientes);
        this.cargarCitasPendientes();
      },
      error: (err) => {
        console.error('Error al cargar datos reales del dashboard', err);
        this.isLoading = false;
      }
    });
  }

  cargarCitasPendientes() {
    this.tutoriasService.getMisCitas().subscribe({
      next: (citas) => {
        const pendientes = citas.filter((c: any) => c.estado === 'Pendiente');
        
        this.actividadesProximas = pendientes.map((c: any) => ({
          id: c.id_cita,
          tarea: `Tutoría de ${c.materia}`,
          tipo: 'Sesión 1 a 1',
          tiempo: new Date(c.fecha).toLocaleDateString() + ' ' + c.hora_inicio.slice(0,5),
          urgente: true
        })).slice(0, 3);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar citas', err);
        this.isLoading = false;
      }
    });
  }

  actualizarStats(racha: number, promedio: number, citas: number) {
    this.stats = [
      { titulo: 'Racha Activa', valor: `${racha} días`, icono: '🔥', iconClass: 'icon-orange' },
      { titulo: 'Promedio Global', valor: promedio.toFixed(1), icono: '⭐', iconClass: 'icon-yellow' },
      { titulo: 'Citas Pendientes', valor: citas.toString(), icono: '📅', iconClass: 'icon-blue' },
      { titulo: 'Estilo VAK', valor: this.estiloVak, icono: '🧠', iconClass: 'icon-purple' }
    ];
  }
}