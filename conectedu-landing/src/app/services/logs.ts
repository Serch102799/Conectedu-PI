import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private apiUrl = 'http://localhost:3000/api/logs';

  private getHeaders() {
    const idUsuarioLogueado = localStorage.getItem('usuario_id') || ''; 
    return {
      headers: new HttpHeaders({
        'usuario-id': idUsuarioLogueado
      })
    };
  }

  constructor(private http: HttpClient) { }

  getLogs(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }
}