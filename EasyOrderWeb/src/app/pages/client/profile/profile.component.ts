import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; // Importe o botão
import { ApiService } from '../../../core/services/api/api.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router'; // Para voltar ao menu

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ClientProfileComponent implements OnInit, OnDestroy {
  api = inject(ApiService);
  auth = inject(AuthService);
  router = inject(Router);
  
  orders: any[] = [];
  intervalId: any;

  ngOnInit() {
    this.loadHistory();
    // Polling: Atualiza o status a cada 10 segundos
    this.intervalId = setInterval(() => this.loadHistory(), 10000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadHistory() {
    this.api.getMyOrders().subscribe({
      next: (data) => this.orders = data,
      error: (err) => console.error('Erro ao carregar histórico', err)
    });
  }
  
  logout() {
    this.auth.logout();
    // Redireciona para o menu da mesa 1 (ou idealmente salva a mesa no localStorage)
    const lastDesk = localStorage.getItem('deskId') || '1';
    this.router.navigate(['/menu', lastDesk]);
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'recebido': return 'orange';
      case 'preparando': return 'blue';
      case 'pronto': return 'green';
      default: return 'gray';
    }
  }
}