import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const token = localStorage.getItem('token');
  
  // --- DEBUG ---
  console.log('🕵️‍♂️ Interceptor rodando para:', req.url);
  console.log('🔑 Token encontrado?', !!token); // True ou False

  if (token) {
    const cloned = req.clone({
      setHeaders: { 
        Authorization: `Bearer ${token}` 
      }
    });
    return next(cloned);
  }
  
  return next(req);
};