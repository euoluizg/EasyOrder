import { Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api/api.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { DecimalPipe, UpperCasePipe } from '@angular/common';


// --- DIALOG DE CRIAR MESA ---
@Component({
  selector: 'dialog-create-desk',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule
],
  template: `
    <h2 mat-dialog-title>Nova Mesa</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 10px; min-width: 300px;">
        <mat-form-field><mat-label>Número da Mesa</mat-label><input matInput type="number" [(ngModel)]="data.deskNumber"></mat-form-field>
        <mat-form-field><mat-label>Capacidade</mat-label><input matInput type="number" [(ngModel)]="data.capacity"></mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="data">Salvar</button>
    </mat-dialog-actions>
  `
})
export class CreateDeskDialog { data: any = {}; }

// --- DIALOG DE VER QR CODE ---
@Component({
  selector: 'dialog-qr-view',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    QRCodeComponent
],
  template: `
    <h2 mat-dialog-title>Mesa {{ data.deskNumber }}</h2>
    
    <mat-dialog-content style="text-align: center; padding: 20px;">
      
      <div class="qr-container">
        <qrcode 
          [qrdata]="getQrData()" 
          [width]="250" 
          [errorCorrectionLevel]="'M'">
        </qrcode>
      </div>
           
      <div style="margin-top: 15px;">
        <p style="font-weight: bold; margin: 0;">Link da Mesa:</p>
        <small class="url-text">{{ getQrData() }}</small>
      </div>

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button color="primary" (click)="imprimir()">Imprimir</button>
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .qr-container { 
      display: inline-block; 
      padding: 10px; 
      border: 1px solid #ddd; 
      border-radius: 8px; 
      background: white;
    }
    .url-text { color: #666; word-break: break-all; }
  `]
})
export class QrViewDialog { 
  data = inject(MAT_DIALOG_DATA);

  // URL base do seu site 
  baseUrl = 'https://euoluizg.github.io/EasyOrder'; 

  getQrData() {
    // Se a mesa tiver um UID (criado pelo backend), usa ele. 
    // Se não, usa o ID (menos seguro, mas funciona).
    const id = this.data.qrCodeUid || this.data.idDesk;
    return `${this.baseUrl}/menu/${id}`;
  }

  imprimir() {
    window.print();
  }
}


// --- COMPONENTE PRINCIPAL ---
@Component({
  selector: 'app-desk-manager',
  standalone: true,
  imports: [
    UpperCasePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
],
  templateUrl: './desk-manager.component.html',
  styleUrl: './desk-manager.component.scss'
})
export class DeskManagerComponent implements OnInit {
  api = inject(ApiService);
  dialog = inject(MatDialog);
  snack = inject(MatSnackBar);
  
  desks: any[] = [];

  ngOnInit() { this.load(); }


  load() {
    this.api.getDesks().subscribe({
      next: (data) => {
        console.log('✅ Mesas carregadas do Servidor:', data); // Debug
        this.desks = data;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar mesas:', err); // Debug
        this.snack.open('Erro ao buscar mesas. Verifique o Console.', 'Fechar');
      }
    });
  }

  createDesk() {
    const ref = this.dialog.open(CreateDeskDialog);
    ref.afterClosed().subscribe(res => {
      if (res && res.deskNumber) {
        const num = Number(res.deskNumber);
        const cap = Number(res.capacity);
        
        this.api.createDesk(num, cap).subscribe({
          next: (response: any) => {
            this.snack.open('Mesa criada com sucesso!', 'OK', { duration: 3000 });
            this.load();
            // Abre o QR Code logo após criar
            const dialogData = {
              ...response.desk,
              qr_code_image: response.qr_code_image
            };

            this.dialog.open(QrViewDialog, { data: dialogData });
          },
          error: (err) => {
            console.error(err);
            this.snack.open('Erro ao criar mesa', 'Fechar');
          }
        });
      }
    });
  }

  updateStatus(id: number, condition: string) {
    this.api.updateDesk(id, { condition }).subscribe(() => this.load());
  }

  showQr(desk: any) {
    this.dialog.open(QrViewDialog, { data: desk });
  }

  deleteDesk(id: number) {
    if(confirm('Tem certeza que deseja deletar esta mesa?')) {
      this.api.deleteDesk(id).subscribe(() => this.load());
    }
  }
}