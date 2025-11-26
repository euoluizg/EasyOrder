import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  auth = inject(AuthService);
  router = inject(Router);

  userName = '';

  constructor() {
    this.userName = this.auth.getUserName();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}