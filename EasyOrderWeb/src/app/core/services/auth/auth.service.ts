import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { tap } from 'rxjs/operators';
import { AuthResponse } from '../../models/interfaces';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  
  // Signals para estado reativo (novo no Angular)
  currentUser = signal<any>(null);

  // --- ADMIN ---
  adminLogin(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/admin/login`, { email, password })
      .pipe(tap(res => this.saveToken(res.access_token)));
  }

  // --- CLIENT ---
  clientLogin(identifier: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/clients/login`, { login_identifier: identifier, password })
      .pipe(tap(res => this.saveToken(res.access_token)));
  }

  clientRegister(name: string, password: string, phone: string) {
    // Chama registro e depois loga automaticamente no componente
    return this.http.post(`${this.apiUrl}/clients/register`, { name, password, phone });
  }

  // --- UTILS ---
  private saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}