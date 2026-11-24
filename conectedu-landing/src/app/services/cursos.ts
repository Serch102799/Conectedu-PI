import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CursosService {
  private apiUrl = 'http://localhost:3000/api/cursos';

  private getHeaders() {
    const idUsuarioLogueado = localStorage.getItem('usuario_id') || '';

    return {
      headers: new HttpHeaders({
        'usuario-id': idUsuarioLogueado
      })
    };
  }

  constructor(private http: HttpClient) { }

  getCursos(): Observable<any> { return this.http.get(this.apiUrl, this.getHeaders()); }
  crearCurso(curso: any): Observable<any> { return this.http.post(this.apiUrl, curso, this.getHeaders()); }
  actualizarCurso(id: number, curso: any): Observable<any> { return this.http.put(`${this.apiUrl}/${id}`, curso, this.getHeaders()); }
  eliminarCurso(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders()); }
}