import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private apiUrl = 'http://localhost:3000/api/notificaciones';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const idUsuarioLogueado = localStorage.getItem('usuario_id') || '';
    return {
      headers: new HttpHeaders({
        'usuario-id': idUsuarioLogueado
      })
    };
  }

  getNotificaciones(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }

  marcarComoLeida(id_notificacion: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id_notificacion}/leida`, {}, this.getHeaders());
  }
}
