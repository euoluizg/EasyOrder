import { Component, inject, OnInit, OnDestroy } from '@angular/core'; // Adicione OnDestroy
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy { // Implemente OnDestroy
  api = inject(ApiService);
  
  stats = { totalRevenue: 0, totalOrders: 0 };
  
  // Variável para controlar o relógio
  intervalId: any;

  ngOnInit() {
    this.loadStats();
    
    // --- AUTO-RELOAD ---
    // Atualiza a cada 30 segundos (30000 ms)
    this.intervalId = setInterval(() => {
      console.log('Atualizando Dashboard...');
      this.loadStats();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadStats() {
    this.api.getDashboardStats().subscribe({
      next: (data) => {
        if (data) this.stats = data;
      },
      error: (err) => console.error('Erro ao carregar stats', err)
    });
  }
}