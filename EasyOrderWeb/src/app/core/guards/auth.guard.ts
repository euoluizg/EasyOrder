import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // IMPORTANTE: Tem que retornar TRUE para deixar passar
  if (authService.getToken()) {
    console.log('Guard: Token encontrado. Acesso permitido.');
    return true; 
  } else {
    console.log('Guard: Sem token. Bloqueando acesso.');
    router.navigate(['/admin/login']);
    return false;
  }
};