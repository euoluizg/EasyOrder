import { ApplicationConfig} from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';
import { environment } from '../environments/environments';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';


import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getStorage, provideStorage } from '@angular/fire/storage';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, 
    withComponentInputBinding(), withHashLocation()), // Permite pegar ID da URL fácil
    { provide: LocationStrategy, useClass: HashLocationStrategy },   // Configura rota com # para evitar problemas de servidor
    provideHttpClient(withInterceptors([authInterceptor])),

    provideFirebaseApp(() => initializeApp((environment as any).firebase)),
    provideStorage(() => getStorage())
  ]
};