import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../../../core/services/api/api.service'; // Ajuste os ../ se necessário

@Component({
  selector: 'app-order-items',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './order-items.component.html',
  styleUrl: './order-items.component.scss'
})
export class OrderItemsComponent implements OnInit {
  api = inject(ApiService);
  data = inject(MAT_DIALOG_DATA); // Recebe { order: ... }
  
  items: any[] = [];
  loading = true;

  ngOnInit() {
    // Chama a API para pegar os itens deste pedido específico
    this.api.getOrderItems(this.data.order.idOrder).subscribe({
      next: (res) => {
        this.items = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // Helper para ler o JSON de customização (ex: {"Sem cebola": true})
  getCustomKeys(obj: any) {
    return obj ? Object.keys(obj) : [];
  }
}