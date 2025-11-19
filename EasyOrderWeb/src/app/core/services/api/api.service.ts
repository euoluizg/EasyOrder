import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { MenuItem } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getMenu() {
    // Rota pública
    return this.http.get<MenuItem[]>(`${this.apiUrl}/menu-items/readAll`);
  }

  getOrders() {
    // Rota privada (cozinha)
    return this.http.get<any[]>(`${this.apiUrl}/orders/`);
  }
  
  updateOrderStatus(id: number, status: string) {
    return this.http.patch(`${this.apiUrl}/orders/${id}/status`, { status });
  }
}