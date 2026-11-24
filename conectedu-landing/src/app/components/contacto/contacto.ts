import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: false,
  templateUrl: './contacto.html',
  styleUrls: ['./contacto.css']
})
export class Contacto implements OnInit {
  contactoForm!: FormGroup;
  isSubmitting: boolean = false;
  showSuccess: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.contactoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  enviarMensaje() {
    if (this.contactoForm.valid) {
      this.isSubmitting = true;
      this.showSuccess = false;

      setTimeout(() => {
        console.log('Datos enviados:', this.contactoForm.value);
        this.isSubmitting = false;
        this.showSuccess = true;
        this.contactoForm.reset();

        setTimeout(() => {
          this.showSuccess = false;
        }, 5000);
      }, 2000);
    } else {
      this.contactoForm.markAllAsTouched();
    }
  }

  get nombreValido() {
    return this.contactoForm.get('nombre')?.invalid && this.contactoForm.get('nombre')?.touched;
  }

  get emailValido() {
    return this.contactoForm.get('email')?.invalid && this.contactoForm.get('email')?.touched;
  }

  get mensajeValido() {
    return this.contactoForm.get('mensaje')?.invalid && this.contactoForm.get('mensaje')?.touched;
  }
}