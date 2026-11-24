import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  // La ruta base de tu backend
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Función que envía los datos al backend para login
  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }

  // Función para registrar un nuevo usuario (con estado pendiente y VAK)
  register(datosRegistro: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datosRegistro);
  }
}