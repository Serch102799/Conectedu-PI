import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Usuarios {
  private apiUrl = 'http://localhost:3000/api/usuarios';

  private getHeaders() {
    const idUsuarioLogueado = localStorage.getItem('usuario_id') || '';
    return {
      headers: new HttpHeaders({
        'usuario-id': idUsuarioLogueado
      })
    };
  }

  constructor(private http: HttpClient) { }

  evaluarRiesgoIA(idUsuario: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/evaluar-riesgo/${idUsuario}`, {}, this.getHeaders());
  }

  getUsuarios(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario, this.getHeaders());
  }

  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario, this.getHeaders());
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
  getTutores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tutores`, this.getHeaders());
  }

  aprobarUsuario(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/aprobar`, {}, this.getHeaders());
  }
}