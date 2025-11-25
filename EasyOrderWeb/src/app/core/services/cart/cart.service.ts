import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// Verifique se o nome do arquivo é 'environment.ts' ou 'environments.ts' na sua pasta
import { environment } from '../../../../environments/environments';
import { CartItem, MenuItem } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // O BehaviorSubject guarda o estado atual do carrinho
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartItems.asObservable();
  
  private deskId: number | null = null;

  setDesk(id: number) {
    this.deskId = id;
    localStorage.setItem('deskId', id.toString());
  }

  getDesk() {
    return this.deskId || Number(localStorage.getItem('deskId'));
  }

  // --- ATUALIZADO: Agora aceita 'custom' (opções do prato) ---
  addToCart(item: MenuItem, amount: number = 1, observation: string = '', custom: any = null) {
    const current = this.cartItems.value;
    
    // Cria o objeto do item no carrinho
    const newItem: CartItem = { 
      ...item, 
      amount: amount, 
      observation: observation,
      custom: custom // Salva as personalizações (ex: { "Ponto": "Ao Ponto" })
    };

    // Adiciona à lista existente
    this.cartItems.next([...current, newItem]);
    
    console.log('Item adicionado:', newItem);
  }

  getItems(): CartItem[] {
    return this.cartItems.value;
  }

  clearCart() {
    this.cartItems.next([]);
  }

  sendOrder() {
    const deskId = this.getDesk();

    if (!deskId) {
      throw new Error('Mesa não identificada. Escaneie o QR Code novamente.');
    }

    const itemsPayload = this.cartItems.value.map(item => {
      // --- A CORREÇÃO MÁGICA ESTÁ AQUI ---
      // Tenta ler 'idItem' (CamelCase) OU 'iditem' (Minúsculo) OU 'idItem' (do objeto data)
      const realId = item.idItem || (item as any).iditem || (item as any).id;

      if (!realId) {
        console.error('🚨 ERRO CRÍTICO: Item sem ID no carrinho!', item);
        alert('Erro interno: Item sem ID. Tente recarregar o cardápio.');
        throw new Error('Item sem ID');
      }

      return {
        idItem: realId,      // Enviamos sempre como 'idItem' para o Python aceitar
        amount: item.amount,
        observation: item.observation || '',
        custom: item.custom || null
      };
    });

    const payload = {
      idDesk: deskId,
      items: itemsPayload,
      observation: '' 
    };

    console.log('📦 Payload do Pedido:', payload);

    return this.http.post(`${this.apiUrl}/orders/create`, payload);
  }
}