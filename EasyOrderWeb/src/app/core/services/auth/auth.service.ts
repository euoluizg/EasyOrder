import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments'; 
import { retry, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  // --- GESTÃO DE TOKEN (A CORREÇÃO PRINCIPAL) ---
  getToken() {
    // Retorna a string do token ou null se não existir
    return localStorage.getItem('token');
  }

  private saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  logout() {
    localStorage.removeItem('token');
    // Redireciona para login admin por padrão, mas poderia ser home
    this.router.navigate(['/admin/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken(); // Retorna true se tiver token
  }

  private getPayload(){
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // Pega o usuário logado (ID e Type) do token
  getCurrentUser() {
    const payload = this.getPayload();
    if (!payload) return null;
    
    return {
      id: payload.sub, // 'sub' é o padrão JWT para o ID (identity)
      type: payload.type // 'type' é o claim que adicionamos no backend
    };
  }

  // --- REGRAS DE PERMISSÃO (RBAC) ---
  
  // Verifica se o usuário tem um dos cargos permitidos
  hasRole(allowedRoles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.type) return false;
    return allowedRoles.includes(user.type);
  }

  // Verifica se o usuário pode editar outro usuário específico
  canEditUser(targetUser: any): boolean {
    const me = this.getCurrentUser();
    if (!me) return false;

    // REGRA 1: Eu posso SEMPRE editar o meu próprio perfil
    // (Convertendo para string para garantir, pois ID pode vir como numero)
    if (String(me.id) === String(targetUser.idUser)) {
      return true;
    }

    // REGRA 2: Dono pode editar qualquer um
    if (me.type === 'dono') {
      return true;
    }

    // REGRA 3: Gerente pode editar qualquer um, EXCETO o Dono
    if (me.type === 'gerente' && targetUser.type !== 'dono') {
      return true;
    }

    // Garçom/Cozinha não editam ninguém além de si mesmos
    return false;
  }

  // --- ADMIN ACTIONS ---
  adminLogin(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/admin/login`, { email, password })
      .pipe(
        retry(2),
        tap(res => {
        if (res.access_token) {
          this.saveToken(res.access_token);

          if(res.user && res.user.name){
            localStorage.setItem('username', res.user.name);
          }
        }
      }));
  }

  getUserName(): string {
    return localStorage.getItem('username') || '';
  }

  // --- CLIENT ACTIONS (ADICIONADO AGORA) ---
  clientLogin(identifier: string, password: string) {
    const payload = {
      loginIdentifier: identifier, 
      password: password
    };

    return this.http.post<any>(`${this.apiUrl}/client/login`, payload) // (Confira se é /clients ou /client)
      .pipe(tap(res => {
        console.log('RESPOSTA DO LOGIN:', res); // <--- Debug

        if (res.accessToken) {
          this.saveToken(res.accessToken);
          console.log('✅ Token salvo no LocalStorage!');
        } else {
          console.error('❌ A API não mandou accessToken!');
        }
      }));
  }

  clientRegister(name: string, password: string, identifier: string) {
    const isEmail = identifier.includes('@');
    
    const payload = {
      name: name,
      password: password,
      email: isEmail ? identifier : null,
      phone: !isEmail ? identifier : null
    };

    return this.http.post(`${this.apiUrl}/client/register`, payload);
  }
}