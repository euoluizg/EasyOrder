import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// --- COMPONENTES ADMIN (IMPORTS) ---
import { LoginComponent } from './pages/admin/login/login.component';
import { LayoutComponent } from './pages/admin/layout/layout.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { KitchenComponent } from './pages/admin/kitchen/kitchen.component';
import { MenuManagerComponent } from './pages/admin/menu-manager/menu-manager.component';
import { DeskManagerComponent } from './pages/admin/desk-manager/desk-manager.component';
import { UserManagerComponent } from './pages/admin/user-manager/user-manager.component';

// --- COMPONENTES CLIENTE (Adicione estas importações) ---
import { MenuComponent } from './pages/client/menu/menu.component';
import { AuthComponent } from './pages/client/auth/auth.component';
import { ClientProfileComponent } from './pages/client/profile/profile.component';
import { OrderTrackingComponent } from './pages/client/order-tracking/order-tracking.component';


export const routes: Routes = [

  // ==================================================
  // 🌍 ÁREA PÚBLICA (CLIENTE)
  // ==================================================
  
  // Rota do Cardápio (Acessada via QR Code: meurestaurante.com/menu/1)
  { path: 'menu/:deskId', component: MenuComponent },
  
  // Rota de Login/Cadastro do Cliente (Acessada ao finalizar pedido)
  { path: 'client/auth', component: AuthComponent },

  // Rota de Perfil do Cliente
  { path: 'client/profile', component: ClientProfileComponent },

  // Rota para acompanhar um pedido específico
  { path: 'client/track/:id', component: OrderTrackingComponent },

  // ==================================================
  // 🔒 ÁREA ADMINISTRATIVA (SOMENTE FUNCIONÁRIOS)
  // ==================================================

  // 1. Login do Admin (Dono/Gerente/Cozinha/Garçom)
  { path: 'admin/login', component: LoginComponent },

  // 2. Painel Principal (Protegido pelo authGuard)
  { 
    path: 'admin', 
    component: LayoutComponent, // Carrega o Menu Lateral e Toolbar
    canActivate: [authGuard],   // Só entra se tiver token válido
    children: [
      { path: 'dashboard', component: DashboardComponent },       // Estatísticas
      { path: 'kitchen', component: KitchenComponent },           // Pedidos em Tempo Real
      { path: 'menu-manager', component: MenuManagerComponent },  // Gestão de Pratos
      { path: 'desks', component: DeskManagerComponent },         // Gestão de Mesas
      { path: 'users', component: UserManagerComponent },         // Gestão de Equipe
      
      // Se acessar '/admin' direto, redireciona para o dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ==================================================
  // 🔄 REDIRECIONAMENTOS PADRÃO
  // ==================================================
  
  // Qualquer acesso à raiz ('/') manda para o login do admin
  { path: '', redirectTo: 'admin/login', pathMatch: 'full' },
  
  // Qualquer rota desconhecida (404) manda para o login do admin
  { path: '**', redirectTo: 'admin/login' }
];