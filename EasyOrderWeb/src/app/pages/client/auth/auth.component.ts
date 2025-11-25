import { Component, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CartService } from '../../../core/services/cart/cart.service';

@Component({
  selector: 'app-client-auth',
  standalone: true,
  imports: [FormsModule, MatTabsModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  router = inject(Router);
  location = inject(Location);

  loginData = { id: '', pass: '' };
  regData = { name: '', phone: '', pass: '' };

  goBack() { this.location.back(); }

  finish() {
    this.cart.sendOrder().subscribe({
      next: (res: any) => { 
        alert('Pedido enviado com sucesso!');
        this.cart.clearCart();
        
        // Se o pedido foi feito no login, também vai para o rastreio
        if (res && res.idOrder) {
            this.router.navigate(['/client/track', res.idOrder]);
        } else {
            // Fallback se algo der errado
            const desk = this.cart.getDesk();
            this.router.navigate(['/menu', desk]);
        }
      },
      error: () => {
        alert('Logado com sucesso! Mas o carrinho estava vazio ou deu erro.');
        const desk = this.cart.getDesk();
        this.router.navigate(['/menu', desk]);
      }
    });
  }
  doLogin() {
    this.auth.clientLogin(this.loginData.id, this.loginData.pass).subscribe(() => this.finish());
  }

  doRegister() {
    this.auth.clientRegister(this.regData.name, this.regData.pass, this.regData.phone).subscribe(() => {
      // Após registrar, faz login automático
      this.auth.clientLogin(this.regData.phone, this.regData.pass).subscribe(() => this.finish());
    });
  }
}