import { Component, inject, OnInit, OnDestroy } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider'; // <--- CORREÇÃO 1: Importe isto
import { ApiService } from '../../../core/services/api/api.service';
import { OrderItemsComponent } from './dialogs/order-items/order-items.component';
import { UpperCasePipe, DecimalPipe } from '@angular/common';


// --- DIALOG: DETALHES DO PEDIDO (ITENS) ---
@Component({
  selector: 'dialog-order-items',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Pedido #{{ data.order.idOrder }} - Mesa {{ data.order.deskNumber }}</h2>
    <mat-dialog-content>
      @if (loading) {
        <div>Carregando itens...</div>
      }
    
      @if (!loading) {
        <ul style="list-style: none; padding: 0;">
          @for (item of items; track item) {
            <li style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem;">
                <span>{{ item.amount }}x {{ item.name }}</span>
              </div>
              @if (item.observation) {
                <div style="color: red; font-size: 0.9rem; margin-top: 5px;">
                  ⚠️ Obs: {{ item.observation }}
                </div>
              }
              @if (item.custom) {
                <div style="color: #666; font-size: 0.9rem; margin-top: 5px;">
                  @for (opt of getCustomKeys(item.custom); track opt) {
                    <div>
                      • {{ opt }}: {{ item.custom[opt] }}
                    </div>
                  }
                </div>
              }
            </li>
          }
        </ul>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
    `
})
export class OrderItemsDialog implements OnInit {
  api = inject(ApiService);
  data = inject(MAT_DIALOG_DATA);
  items: any[] = [];
  loading = true;

  ngOnInit() {
    this.api.getOrderItems(this.data.order.idOrder).subscribe(res => {
      this.items = res;
      this.loading = false;
    });
  }

  getCustomKeys(obj: any) {
    return obj ? Object.keys(obj) : [];
  }
}

// --- COMPONENTE PRINCIPAL ---
@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [
    UpperCasePipe,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule
],
  templateUrl: './kitchen.component.html',
  styleUrl: './kitchen.component.scss'
})
export class KitchenComponent implements OnInit, OnDestroy {
  api = inject(ApiService);
  dialog = inject(MatDialog);
  
  orders: any[] = [];
  intervalId: any;

  ngOnInit() {
    this.load();
    // Atualiza automaticamente a cada 15 segundos
    this.intervalId = setInterval(() => this.load(), 15000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  load() {
    this.api.getOrders().subscribe(data => this.orders = data);
  }

  viewItems(order: any) {
    this.dialog.open(OrderItemsComponent, {
      data: { order: order},
      width: '500px',
      maxHeight: '90vh'
    });
  }

  updateStatus(id: number, status: string) {
    if(confirm(`Mudar status para ${status.toUpperCase()}?`)) {
      this.api.updateOrderStatus(id, status).subscribe(() => this.load());
    }
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'recebido': return 'warn'; // Vermelho/Laranja
      case 'preparando': return 'primary'; // Azul
      case 'pronto': return 'accent'; // Verde/Rosa
      default: return undefined;
    }
  }
}