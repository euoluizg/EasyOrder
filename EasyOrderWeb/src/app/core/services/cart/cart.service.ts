import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, MenuItem } from '../../models/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

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

  addToCart(item: MenuItem) {
    const current = this.cartItems.value;
    const existing = current.find(i => i.idItem === item.idItem);
    
    if (existing) {
      existing.amount++;
      this.cartItems.next([...current]);
    } else {
      this.cartItems.next([...current, { ...item, amount: 1 }]);
    }
  }

  clearCart() {
    this.cartItems.next([]);
  }

  sendOrder() {
    const items = this.cartItems.value.map(i => ({
      idItem: i.idItem,
      amount: i.amount,
      observation: i.observation
    }));

    const payload = {
      idDesk: this.getDesk(),
      items: items
    };

    return this.http.post(`${this.apiUrl}/orders`, payload);
  }
}