import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { App } from './app';
import { Navbar } from './components/navbar/navbar';
import { Inicio } from './components/inicio/inicio';
import { Servicios } from './components/servicios/servicios';
import { Conocenos } from './components/conocenos/conocenos';
import { Contacto } from './components/contacto/contacto';
import { Footer } from './components/footer/footer';
import { Layout } from './plataforma/layout/layout';
import { InicioDashboard } from './plataforma/inicio-dashboard/inicio-dashboard';
import { Cursos } from './plataforma/cursos/cursos';
import { Foro } from './plataforma/foro/foro';
import { Test } from './plataforma/test/test';
import { Tutorias } from './plataforma/tutorias/tutorias';
import { Landing } from './landing/landing';
import { ScrollRevealDirective } from './directives/scroll-reveal';
import { Login } from './components/login/login';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { UsuariosAdminComponent } from './plataforma/usuarios-admin/usuarios-admin';
import { LogsComponent } from './plataforma/logs/logs.component';
import { TutoriasEstudianteComponent } from './plataforma/tutorias-estudiante/tutorias-estudiante.component';
import { PanelTutorComponent } from './plataforma/panel-tutor/panel-tutor.component';
import { MisCitasComponent } from './plataforma/mis-citas/mis-citas.component';
import { PrediccionComponent } from './plataforma/prediccion/prediccion.component';

const routes: Routes = [
  { path: '', component: Landing }, 
  
  { path: 'login', component: Login },
  
  { 
    path: 'plataforma', 
    component: Layout,
    children: [
      { path: 'inicio', component: InicioDashboard },
      { path: 'cursos', component: Cursos },
      { path: 'foro', component: Foro },
      { path: 'test', component: Test },
      { path: 'tutorias', component: TutoriasEstudianteComponent },
      { path: 'mis-citas', component: MisCitasComponent },
      { path: 'panel-tutor', component: PanelTutorComponent },
      { path: 'usuarios', component: UsuariosAdminComponent },
      { path: 'logs', component: LogsComponent },
      { path: 'prediccion', component: PrediccionComponent },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    App,
    Navbar,
    Inicio,
    Servicios,
    Conocenos,
    Contacto,
    Footer,
    Layout,
    InicioDashboard,
    Cursos,
    Foro,
    Test,
    Tutorias,
    Landing,
    ScrollRevealDirective,
    Login,
    UsuariosAdminComponent,
    LogsComponent,
    TutoriasEstudianteComponent,
    PanelTutorComponent,
    MisCitasComponent,
    PrediccionComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
  ],
  bootstrap: [App]
})
export class AppModule { }
