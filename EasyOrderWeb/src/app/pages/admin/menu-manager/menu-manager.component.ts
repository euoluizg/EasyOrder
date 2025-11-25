import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Para mostrar upload

import { ApiService } from '../../../core/services/api/api.service';
import { StorageService } from '../../../core/services/storage/storage.service';
import { MenuItem } from '../../../core/models/interfaces';

// =========================================================
// 1. SUB-COMPONENTE: DIALOG (Formulário de Criar/Editar)
// =========================================================
@Component({
  selector: 'dialog-menu-form',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatDialogModule, 
    MatSelectModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Novo' }} Prato</h2>
    
    <mat-dialog-content>
      <div class="form-container">
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome do Prato</mat-label>
          <input matInput [(ngModel)]="data.name" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Categoria</mat-label>
          <mat-select [(ngModel)]="data.category" required>
            <mat-option value="Lanches">🍔 Lanches</mat-option>
            <mat-option value="Bebidas">🥤 Bebidas</mat-option>
            <mat-option value="Sobremesas">🍰 Sobremesas</mat-option>
            <mat-option value="Refeicoes">🍛 Refeições</mat-option>
            <mat-option value="Outros">Outros</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="row-inputs">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Preço Venda (R$)</mat-label>
            <input matInput type="number" [(ngModel)]="data.price" required min="0">
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Custo (R$)</mat-label>
            <input matInput type="number" [(ngModel)]="data.cost" min="0">
          </mat-form-field>
        </div>

        <div class="row-inputs align-center">
           <mat-form-field appearance="outline" class="half-width">
            <mat-label>Tempo (min)</mat-label>
            <input matInput type="number" [(ngModel)]="data.timePreparation">
          </mat-form-field>
          
          <div class="toggle-wrapper">
            <mat-slide-toggle [(ngModel)]="data.emphasis" color="accent">Destacar 🔥</mat-slide-toggle>
          </div>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descrição</mat-label>
          <textarea matInput [(ngModel)]="data.description" rows="3" placeholder="Ingredientes..."></textarea>
        </mat-form-field>

        <div class="upload-section">
          <div class="upload-header">
            <label>Imagem</label>
          </div>
          
          <div class="upload-row">
            <img [src]="data.imagePath || 'https://placehold.co/100x100?text=Sem+Foto'" 
                 class="img-preview" 
                 onerror="this.src='https://placehold.co/100x100?text=Sem+Foto'">
            
            <input type="file" #fileInput (change)="onFileSelected($event)" style="display: none" accept="image/*">
            
            <button mat-stroked-button type="button" (click)="fileInput.click()" [disabled]="uploading">
              <mat-icon>cloud_upload</mat-icon> {{ uploading ? 'Enviando...' : 'Escolher Foto' }}
            </button>
          </div>
          
          <mat-progress-bar *ngIf="uploading" mode="indeterminate"></mat-progress-bar>
        </div>

      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" 
              [mat-dialog-close]="data" 
              [disabled]="!data.name || !data.price || uploading">
        Salvar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-container { display: flex; flex-direction: column; gap: 8px; min-width: 350px; padding-top: 10px; }
    .full-width { width: 100%; }
    .row-inputs { display: flex; gap: 10px; }
    .half-width { flex: 1; }
    .align-center { align-items: center; }
    .toggle-wrapper { padding-bottom: 15px; }
    .upload-section { border: 1px dashed #ccc; padding: 10px; border-radius: 4px; background: #fafafa; }
    .upload-row { display: flex; align-items: center; gap: 15px; margin-bottom: 5px; }
    .img-preview { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; }
  `]
})
export class MenuFormDialog {
  inputData = inject(MAT_DIALOG_DATA);
  storage = inject(StorageService); // <--- AQUI ENTRA O SEU STORAGE
  snack = inject(MatSnackBar);

  data: any = { active: true, category: 'Lanches' };
  isEdit = false;
  uploading = false;

  constructor() {
    if (this.inputData) {
      this.isEdit = true;
      this.data = { ...this.inputData };
    }
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploading = true;
      try {
        // Define o caminho no Firebase: menu/TIMESTAMP_NOME
        const path = `menu/${Date.now()}_${file.name}`;
        
        // Faz o upload e pega a URL
        const url = await this.storage.uploadFile(file, path);
        
        // Salva a URL no objeto para enviar ao Python
        this.data.imagePath = url;
        
        this.snack.open('Upload concluído!', 'OK', { duration: 2000 });
      } catch (error) {
        console.error(error);
        this.snack.open('Erro ao enviar imagem.', 'Fechar');
      } finally {
        this.uploading = false;
      }
    }
  }
}


// =========================================================
// 2. COMPONENTE PRINCIPAL (A Lista)
// =========================================================
@Component({
  selector: 'app-menu-manager',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSlideToggleModule, 
    MatDialogModule, 
    MatSnackBarModule, 
    MatTooltipModule
  ],
  templateUrl: './menu-manager.component.html',
  styleUrl: './menu-manager.component.scss'
})
export class MenuManagerComponent implements OnInit {
  api = inject(ApiService);
  dialog = inject(MatDialog);
  snack = inject(MatSnackBar);

  items: MenuItem[] = [];
  // Definimos as colunas exatas que usamos no HTML
  displayedColumns = ['image', 'name', 'price', 'active', 'actions'];

  ngOnInit() { this.load(); }

  load() {
    this.api.getMenu().subscribe({
      next: (data) => this.items = data,
      error: (err) => console.error(err)
    });
  }

  // Abre o Dialog (Criar ou Editar)
  openDialog(item?: MenuItem) {
    const ref = this.dialog.open(MenuFormDialog, { data: item });

    ref.afterClosed().subscribe(res => {
      if (!res) return;

      if (item && item.idItem) {
        // EDITAR
        this.api.updateMenuItem(item.idItem, res).subscribe({
          next: () => {
            this.snack.open('Item atualizado!', 'OK', { duration: 3000 });
            this.load();
          },
          error: () => this.snack.open('Erro ao atualizar.', 'Fechar')
        });
      } else {
        // CRIAR
        if (res.name && res.price) {
          this.api.createMenuItem(res).subscribe({
            next: () => {
              this.snack.open('Item criado!', 'OK', { duration: 3000 });
              this.load();
            },
            error: () => this.snack.open('Erro ao criar.', 'Fechar')
          });
        }
      }
    });
  }

  // Alterna Ativo/Inativo rapidamente
  toggleStatus(item: MenuItem) {
    if (!item.idItem) return;
    const newStatus = !item.active;
    
    this.api.updateMenuItem(item.idItem, { active: newStatus }).subscribe({
      next: () => {
        item.active = newStatus;
        const msg = newStatus ? 'Ativado' : 'Pausado';
        this.snack.open(msg, 'OK', { duration: 1500 });
      },
      error: () => {
        item.active = !newStatus; // Reverte se der erro
        this.snack.open('Erro ao mudar status', 'Fechar');
      }
    });
  }

  deleteItem(id: number) {
    if(confirm('Tem certeza que deseja remover este item?')) {
      this.api.deleteMenuItem(id).subscribe({
        next: () => {
          this.snack.open('Item removido.', 'OK', { duration: 3000 });
          this.load();
        },
        error: () => this.snack.open('Erro ao deletar.', 'Fechar')
      });
    }
  }
}