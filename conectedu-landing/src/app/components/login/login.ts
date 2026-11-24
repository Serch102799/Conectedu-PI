import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginForm: FormGroup;
  registerForm: FormGroup;
  
  mensajeError: string = '';
  mensajeExito: string = '';
  
  // Estados de la UI
  isLoginMode: boolean = true;
  registroPaso: number = 1; // 1: Datos básicos, 2: Test VAK
  guardandoRegistro: boolean = false;

  // TEST VAK EXTENDIDO
  preguntasVAK = [
    { text: '1. Cuando estás aprendiendo algo nuevo, prefieres:', options: [{v:'V', t:'Ver diagramas, leer instrucciones o mirar videos.'}, {v:'A', t:'Escuchar una explicación o discutirlo en voz alta.'}, {v:'K', t:'Hacerlo tú mismo a través de la práctica o prueba y error.'}] },
    { text: '2. Para recordar un número telefónico largo, ¿qué sueles hacer?', options: [{v:'V', t:'Lo visualizas en tu mente.'}, {v:'A', t:'Lo repites en voz alta varias veces.'}, {v:'K', t:'Lo "marcas" con tus dedos recordando el movimiento.'}] },
    { text: '3. ¿Qué tipo de actividades te resultan más entretenidas en tu tiempo libre?', options: [{v:'V', t:'Ver películas, leer o mirar fotografías.'}, {v:'A', t:'Escuchar música, podcasts o charlar con amigos.'}, {v:'K', t:'Hacer deporte, bailar o hacer manualidades.'}] },
    { text: '4. Cuando alguien te está dando direcciones para llegar a un lugar:', options: [{v:'V', t:'Prefieres que te dibujen un mapa.'}, {v:'A', t:'Te guías bien por las instrucciones verbales.'}, {v:'K', t:'Prefieres que te lleven la primera vez.'}] },
    { text: '5. En una clase teórica o presentación larga:', options: [{v:'V', t:'Te concentras en las diapositivas o tomas apuntes.'}, {v:'A', t:'Prestas mucha atención a las palabras y el tono del orador.'}, {v:'K', t:'Te desesperas por estar sentado y te mueves constantemente.'}] },
    { text: '6. Al conocer a alguien nuevo, ¿qué es lo que más recuerdas después?', options: [{v:'V', t:'Su rostro y cómo iba vestido.'}, {v:'A', t:'Su nombre y las cosas de las que hablaron.'}, {v:'K', t:'La vibra que transmitía o el saludo de manos.'}] },
    { text: '7. Cuando estás muy enojado o estresado, sueles:', options: [{v:'V', t:'Hacer mala cara o aislarte a leer/ver algo.'}, {v:'A', t:'Levantar la voz o necesitar desahogarte hablando.'}, {v:'K', t:'Caminar de un lado a otro o hacer esfuerzo físico.'}] },
    { text: '8. Para estudiar para un examen difícil:', options: [{v:'V', t:'Haces mapas conceptuales, usas colores y subrayas.'}, {v:'A', t:'Lees en voz alta o pides a alguien que te interrogue.'}, {v:'K', t:'Estudias mientras caminas o recreas escenarios prácticos.'}] },
    { text: '9. A la hora de comprar ropa, ¿qué te influye más?', options: [{v:'V', t:'El color, el diseño y cómo luce en el espejo.'}, {v:'A', t:'Lo que el vendedor u otras personas opinen de ella.'}, {v:'K', t:'La textura de la tela y qué tan cómoda se siente.'}] },
    { text: '10. Cuando lees una novela o libro de ficción:', options: [{v:'V', t:'Te imaginas claramente las escenas como si fuera una película.'}, {v:'A', t:'"Escuchas" las voces de los personajes en tu cabeza.'}, {v:'K', t:'Sientes las emociones físicamente (nervios, adrenalina).'}] },
    { text: '11. Si tienes que armar un mueble (ej. de IKEA):', options: [{v:'V', t:'Miras detalladamente los dibujos del manual.'}, {v:'A', t:'Pides que alguien te lea las instrucciones paso a paso.'}, {v:'K', t:'Ignoras el manual y empiezas a encajar las piezas por intuición.'}] },
    { text: '12. ¿En qué tipo de ambiente prefieres trabajar o estudiar?', options: [{v:'V', t:'En un lugar bien iluminado y ordenado visualmente.'}, {v:'A', t:'En un lugar silencioso o con música suave de fondo.'}, {v:'K', t:'En un lugar donde pueda acomodarme libremente o recostarme.'}] },
  ];
  
  preguntaActualIndex = 0;
  respuestasVAK: string[] = new Array(this.preguntasVAK.length).fill('');

  constructor(
    private fb: FormBuilder, 
    private auth: Auth, 
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.mensajeError = '';
    this.mensajeExito = '';
    if (!this.isLoginMode) {
      this.registroPaso = 1;
      this.preguntaActualIndex = 0;
      this.respuestasVAK.fill('');
      this.registerForm.reset();
    } else {
      this.loginForm.reset();
    }
  }

  siguientePaso() {
    if (this.registerForm.valid) {
      this.registroPaso = 2;
      this.preguntaActualIndex = 0;
    }
  }

  seleccionarOpcion(valor: string) {
    this.respuestasVAK[this.preguntaActualIndex] = valor;
  }

  siguientePregunta() {
    if (this.preguntaActualIndex < this.preguntasVAK.length - 1) {
      this.preguntaActualIndex++;
    }
  }

  preguntaAnterior() {
    if (this.preguntaActualIndex > 0) {
      this.preguntaActualIndex--;
    } else {
      this.registroPaso = 1; // Volver al formulario si está en la primera pregunta
    }
  }

  calcularVak(): string {
    const vals = { V: 0, A: 0, K: 0 };
    for (const r of this.respuestasVAK) {
      if (r === 'V') vals.V++;
      if (r === 'A') vals.A++;
      if (r === 'K') vals.K++;
    }

    let estilo = 'Visual';
    let max = vals.V;
    if (vals.A > max) { estilo = 'Auditivo'; max = vals.A; }
    if (vals.K > max) { estilo = 'Kinestésico'; max = vals.K; }
    
    // Si hay empate, se podría hacer lógica adicional, pero esto es suficiente
    return estilo;
  }

  estiloVakCalculado: string = '';

  registrar() {
    if (!this.guardandoRegistro && this.respuestasVAK[this.preguntaActualIndex] !== '') {
      this.guardandoRegistro = true;
      this.mensajeError = '';
      
      const estilo = this.calcularVak();
      this.estiloVakCalculado = estilo;
      
      const payload = {
        nombre_completo: this.registerForm.value.nombre_completo,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        estilo_vak: estilo,
        id_rol: 3 // 3 = Estudiante
      };

      this.auth.register(payload).subscribe({
        next: (respuesta) => {
          this.guardandoRegistro = false;
          this.registroPaso = 3; // Mostrar pantalla de éxito
        },
        error: (err) => {
          this.guardandoRegistro = false;
          this.mensajeError = err.error?.mensaje || 'Error al enviar la solicitud.';
        }
      });
    }
  }

  ingresar() {
    if (this.loginForm.valid) {
      this.mensajeError = '';
      this.auth.login(this.loginForm.value).subscribe({
        next: (respuesta) => {
          localStorage.setItem('usuario_id', respuesta.usuario.id);
          localStorage.setItem('usuario_rol', respuesta.usuario.rol);
          localStorage.setItem('usuario_nombre', respuesta.usuario.nombre);
          localStorage.setItem('usuario_vak', respuesta.usuario.vak);
          
          this.router.navigate(['/plataforma/inicio']);
        },
        error: (err) => {
          this.mensajeError = err.error?.mensaje || 'Ocurrió un error al conectar con el servidor.';
        }
      });
    }
  }
}