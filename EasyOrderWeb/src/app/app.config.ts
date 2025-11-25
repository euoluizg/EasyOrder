import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';
import { environment } from '../environments/environments';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, 
    withComponentInputBinding()), // Permite pegar ID da URL fácil
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),

    provideFirebaseApp(() => initializeApp((environment as any).firebase)),
    provideStorage(() => getStorage())
  ]
};