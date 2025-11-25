import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../core/services/api/api.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressBarModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.scss'
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  api = inject(ApiService);

  orderId: number = 0;
  order: any = null;
  intervalId: any;
  items: any[] = [];

  ngOnInit() {
    // 1. Pega o ID da URL
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.orderId) {
      this.loadOrder();
      // 2. Atualiza a cada 5 segundos (Polling)
      this.intervalId = setInterval(() => this.loadOrder(), 5000);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadOrder() {
    // Chama a MESMA função que corrigimos no Python (getOrderDetails)
    this.api.getOrderDetails(this.orderId).subscribe({
      next: (data: any) => {
        console.log('📦 DADOS DO PEDIDO:', data);
        console.log('🍔 ITENS:', data.items);
        this.order = data;

        if (data.items) {
            this.items = data.items;
        } else {
            this.items = [];
        }
      },
      error: (err) => console.error('Erro ao buscar pedido', err)
    });
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'recebido': return 'bg-recebido';
      case 'preparando': return 'bg-preparando';
      case 'pronto': return 'bg-pronto';
      case 'entregue': return 'bg-entregue';
      default: return '';
    }
  }

  // Ajuda visual para a barra de progresso
  getProgressValue(status: string) {
    switch(status) {
      case 'recebido': return 33;
      case 'preparando': return 66;
      case 'pronto': return 100;
      case 'entregue': return 100;
      default: return 0;
    }
  }

  getStatusColor(status: string) {
    if (status === 'pronto') return 'accent';
    if (status === 'entregue') return 'primary';
    return 'warn';
  }
  
  getCustomKeys(obj: any) { return obj ? Object.keys(obj) : []; }
}