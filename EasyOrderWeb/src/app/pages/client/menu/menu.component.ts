import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api/api.service';
import { CartService } from '../../../core/services/cart/cart.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { MenuItem } from '../../../core/models/interfaces';
import { ItemDetailsComponent } from '../item-details/item-details.component';

@Component({
  selector: 'app-client-menu',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatRippleModule, MatDialogModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
  @Input() deskId!: string; // Recebe da URL
  
  api = inject(ApiService);
  cart = inject(CartService);
  auth = inject(AuthService);
  router = inject(Router);
  dialog = inject(MatDialog);


  menuItems: MenuItem[] = [];
  menuSections: any[] = []; // Array para guardar categorias (Lanches, Bebidas...)
  realDeskNumber: number | null = null;

  ngOnInit() {
    if (this.deskId) {
      const id = Number(this.deskId);
      this.cart.setDesk(id);

      // --- BUSCA O NÚMERO REAL ---
      this.api.getDeskInfo(id).subscribe({
        next: (res) => this.realDeskNumber = res.deskNumber,
        error: () => this.realDeskNumber = id // Fallback: usa o ID se der erro
      });
    }
    
    this.loadMenu();
  }

  loadMenu() {
    this.api.getMenu().subscribe(data => {
      this.menuSections = this.groupItems(data);
    });
  }

  // Função auxiliar para transformar lista plana em categorias
  groupItems(items: MenuItem[]) {
    const groups: any = {};
    items.forEach(item => {
      const cat = (item as any).category || 'Geral';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return Object.keys(groups).map(key => ({ name: key, items: groups[key] }));
  }

  // Abre o modal de detalhes
  openItem(item: MenuItem) {
    const ref = this.dialog.open(ItemDetailsComponent, {
      data: item,
      maxWidth: '100vw',
      width: '100%',
      panelClass: 'full-screen-modal'
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.cart.addToCart(
          item, 
          result.amount, 
          result.observation, 
          result.custom
        );
      }
    });
  }

  getTotal() {
    return this.cart.getItems().reduce((acc, item) => acc + (item.price * item.amount), 0);
  }

  goToCheckout() {
    if (this.auth.isLoggedIn()) {
      // CENÁRIO 1: JÁ ESTÁ LOGADO
      if(confirm('Enviar pedido para cozinha?')) {
        
        this.cart.sendOrder().subscribe({
          next: (res: any) => {
             // O Backend retorna { idOrder: 123, ... }
             alert('Pedido Recebido! Acompanhando...');
             
             this.cart.clearCart();
             
             // Redireciona para a tela de Rastreio
             this.router.navigate(['/client/track', res.idOrder]); 
          },
          error: () => alert('Erro ao enviar.')
        });
      }
    } else {
      // CENÁRIO 2: NÃO ESTÁ LOGADO
      this.router.navigate(['/client/auth']);
    }
  }
}