import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatInputModule,
    MatButtonModule, 
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  
  auth = inject(AuthService);
  router = inject(Router);
  snack = inject(MatSnackBar);

  login() {
    console.log('1. Botão clicado. Email:', this.email);

    if (!this.email || !this.password) {
      console.log('2. Campos vazios. Parando.');
      return;
    }
    this.isLoading = true;

    this.auth.adminLogin(this.email, this.password).subscribe({
      next: (response) => {
        console.log('3. Sucesso na API! Resposta:', response);
        
        // Verifica se o token foi realmente salvo
        const tokenSalvo = localStorage.getItem('token');
        console.log('4. Token no LocalStorage:', tokenSalvo);

        if (tokenSalvo) {
            console.log('5. Tentando navegar para /admin/dashboard...');
            this.router.navigate(['/admin/dashboard'])
                .then(success => console.log('6. Navegação concluiu?', success))
                .catch(err => console.error('6. Erro na navegação:', err));
        } else {
            console.error('5. ALERTA: Login deu certo, mas o token NÃO foi salvo!');
        }
      },
      error: (err) => {
        console.error('3. Erro na API:', err);
        this.isLoading = false;
        this.snack.open('Erro no login', 'Fechar');
      }
    });
  }
}