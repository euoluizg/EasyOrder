import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MenuItem } from '../../../core/models/interfaces';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule
  ],
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.scss'
})
export class ItemDetailsComponent {
  // Recebe os dados do prato clicado
  data: MenuItem = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ItemDetailsComponent>);

  amount = 1;
  observation = '';
  customOptions: any = null;

  increment() { this.amount++; }
  
  decrement() { 
    if (this.amount > 1) this.amount--; 
  }

  getTotal() { 
    return this.data.price * this.amount; 
  }

  addToCart() {
    // Fecha o modal e retorna o pedido para o menu
    this.dialogRef.close({ 
      amount: this.amount, 
      observation: this.observation,
      custom: this.customOptions
    });
  }
}