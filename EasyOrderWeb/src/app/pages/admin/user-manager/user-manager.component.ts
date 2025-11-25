import { Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from '../../../core/services/api/api.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UpperCasePipe, DecimalPipe } from '@angular/common';

// --- DIALOG CRIAR USUÁRIO ---
@Component({
  selector: 'dialog-user-form',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSelectModule
],
  template: `
    <h2 mat-dialog-title>Novo Funcionário</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 10px; min-width: 300px;">
        <mat-form-field><mat-label>Nome</mat-label><input matInput [(ngModel)]="data.name"></mat-form-field>
        <mat-form-field><mat-label>Email</mat-label><input matInput [(ngModel)]="data.email"></mat-form-field>
        <mat-form-field><mat-label>Senha</mat-label><input matInput [(ngModel)]="data.password" type="password"></mat-form-field>
        <mat-form-field>
          <mat-label>Cargo</mat-label>
          <mat-select [(ngModel)]="data.type">
            <mat-option value="gerente">Gerente</mat-option>
            <mat-option value="garcom">Garçom</mat-option>
            <mat-option value="cozinha">Cozinha</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="data">Salvar</button>
    </mat-dialog-actions>
  `
})
export class UserFormDialog { 
  inputData = inject(MAT_DIALOG_DATA);
  auth = inject(AuthService);

  data: any = { active: true };
  isEdit = false;

  constructor(){
    if (this.inputData){
      this.isEdit = true;

      this.data = { ...this.inputData };
      this.data.password = '';
    }
  }

  canChangeRole(){
    return this.auth.hasRole(['dono']);
  }
 }


@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [
    UpperCasePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule
],
  templateUrl: './user-manager.component.html',
  styleUrl: './user-manager.component.scss'
})
export class UserManagerComponent implements OnInit {
  api = inject(ApiService);
  auth = inject(AuthService);
  dialog = inject(MatDialog);
  
  users: any[] = [];
  displayedColumns = ['name', 'email', 'type', 'actions'];

  ngOnInit() { this.load(); }

  load() {
    this.api.getUsers().subscribe(data => this.users = data);
  }

  getRoleColor(role: string) {
    if (role === 'dono') return 'accent';
    if (role === 'gerente') return 'primary';
    return undefined;
  }

  openUserDialog(userToEdit?: any) {
    const ref = this.dialog.open(UserFormDialog, {
      data: userToEdit
    });

    ref.afterClosed().subscribe(res => {
      if (!res) return;

      if (userToEdit) {
        if (!res.password) delete res.password;

        this.api.updateUser(res.idUser, res).subscribe(() => this.load());
      } else {
        if(res.email && res.password) {
          this.api.createUser(res).subscribe(() => this.load());
        }
      }
    })
  }

  deleteUser(id: number) {
    if(confirm('Remover funcionário?')) {
      this.api.deleteUser(id).subscribe(() => this.load());
    }
  }
}