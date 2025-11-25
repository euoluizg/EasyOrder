import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { MenuItem, User } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // =================================================
  // 🧑‍💼 ADMINISTRAÇÃO (USERS)
  // =================================================
  getUsers() {
    return this.http.get<User[]>(`${this.apiUrl}/admin/readAll`);
  }

  createUser(user: any) {
    // A rota de criar admin é a mesma de registro
    return this.http.post(`${this.apiUrl}/admin/register`, user);
  }

  updateUser(id: number, data: any) {
    return this.http.patch(`${this.apiUrl}/admin/update/${id}`, data);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/admin/delete/${id}`);
  }

  // =================================================
  // 🍽️ MESAS (DESKS)
  // =================================================
  getDesks() {
    return this.http.get<any[]>(`${this.apiUrl}/desk/readAll`);
  }

  createDesk(deskNumber: number, capacity: number) {
    return this.http.post(`${this.apiUrl}/desk/create`, { deskNumber, capacity });
  }

  updateDesk(id: number, data: any) {
    return this.http.patch(`${this.apiUrl}/desk/update/${id}`, data);
  }

  deleteDesk(id: number) {
    return this.http.delete(`${this.apiUrl}/desk/delete/${id}`);
  }

  getDeskInfo(id: number) {
    // Chama a nova rota pública
    return this.http.get<{deskNumber: number}>(`${this.apiUrl}/desk/getInfo/${id}/info`);
  }

  // =================================================
  // 🍔 CARDÁPIO (MENU)
  // =================================================
  getMenu() {
    // Rota pública para ler (usada pelo Admin e pelo Cliente)
    return this.http.get<MenuItem[]>(`${this.apiUrl}/menu/readAll`);
  }

  getItem(id: number){
        return this.http.get<MenuItem[]>(`${this.apiUrl}/menu/read/${id}`);

  }

  createMenuItem(item: any) {
    return this.http.post(`${this.apiUrl}/menu/create`, item);
  }

  updateMenuItem(id: number, data: any) {
    return this.http.patch(`${this.apiUrl}/menu/update/${id}`, data);
  }

  deleteMenuItem(id: number) {
    // Lembra? O Backend faz exclusão lógica (active = false)
    return this.http.delete(`${this.apiUrl}/menu/delete/${id}`);
  }

  // =================================================
  // 👤 CLIENTES (CLIENTS) - O QUE FALTAVA
  // =================================================
  
  // Busca o perfil do cliente logado
  getClientProfile(id: number) {
    return this.http.get<any>(`${this.apiUrl}/client/profile/${id}`);
  }

  // Atualiza dados do cliente
  updateClient(id: number, data: any) {
    return this.http.patch(`${this.apiUrl}/client/update/${id}`, data);
  }

  // Deleta (desativa) a conta do cliente
  deleteClient(id: number) {
    return this.http.delete(`${this.apiUrl}/client/delete/${id}`);
  }

  getMyOrders(){
    return this.http.get<any[]>(`${this.apiUrl}/orders/my-history`);
    
  }

  // =================================================
  // 📝 PEDIDOS (ORDERS)
  // =================================================
  getOrders() {
    return this.http.get<any[]>(`${this.apiUrl}/orders/getAll`);
  }
  
  getOrderItems(orderId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/orders/getById/${orderId}/items`);
  }

  getOrderDetails(orderId: number) {
    return this.http.get<any>(`${this.apiUrl}/orders/getDetail/${orderId}`);
  }

  updateOrderStatus(id: number, status: string) {
    return this.http.patch(`${this.apiUrl}/orders/update/${id}/status`, { status });
  }

  getDashboardStats() {
  return this.http.get<{totalOrders: number, totalRevenue: number}>(`${this.apiUrl}/orders/stats`);  
  }

}