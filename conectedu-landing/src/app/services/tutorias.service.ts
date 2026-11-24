import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TutoriasService {
  private apiUrl = 'http://localhost:3000/api/tutorias';

  private getHeaders() {
    const idUsuarioLogueado = localStorage.getItem('usuario_id') || '';
    return { headers: new HttpHeaders({ 'usuario-id': idUsuarioLogueado }) };
  }

  constructor(private http: HttpClient) { }

  getTutoresPublicos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/publicos`, this.getHeaders());
  }

  getDisponibilidadTutor(idTutor: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/disponibilidad/${idTutor}`, this.getHeaders());
  }

  agendarCita(datosCita: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas`, datosCita, this.getHeaders());
  }
  actualizarMiPerfil(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/mi-perfil`, datos, this.getHeaders());
  }
  agregarHorario(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/horarios`, datos, this.getHeaders());
  }

  eliminarHorario(idDisponibilidad: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/horarios/${idDisponibilidad}`, this.getHeaders());
  }
  getMisCitas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-citas`, this.getHeaders());
  }

  cambiarEstadoCita(idCita: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/citas/${idCita}/estado`, { estado }, this.getHeaders());
  }
}