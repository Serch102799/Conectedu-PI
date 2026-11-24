import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LogsService } from '../../services/logs';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  standalone: false,
  styleUrls: ['./logs.component.css'] // <-- Usa el mismo CSS de usuarios-admin para mantener el estilo
})
export class LogsComponent implements OnInit {
  logs: any[] = [];

  constructor(private logsService: LogsService , private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarLogs();
  }

  cargarLogs() {
    this.logsService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar la bitácora', err)
    });
  }
}