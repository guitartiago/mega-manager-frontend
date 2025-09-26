import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="min-h-svh bg-gray-100">
    <!-- Navbar -->
    <header class="bg-white border-b">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <!-- Brand -->
        <a routerLink="/" class="font-semibold tracking-tight">MegaManager</a>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-4 text-sm">
          <a routerLink="/" routerLinkActive="text-blue-700 font-medium" [routerLinkActiveOptions]="{ exact: true }"
             class="hover:text-black text-gray-700">Home</a>

          <a routerLink="/clientes" routerLinkActive="text-blue-700 font-medium"
             class="hover:text-black text-gray-700">Clientes</a>

          <a routerLink="/produtos" routerLinkActive="text-blue-700 font-medium"
             class="hover:text-black text-gray-700">Produtos</a>

          <a routerLink="/estoque/entrada" routerLinkActive="text-blue-700 font-medium"
             class="hover:text-black text-gray-700">Entrada de estoque</a>

          <a routerLink="/estoque/visualizar" routerLinkActive="text-blue-700 font-medium"
             class="hover:text-black text-gray-700">Visualizar estoque</a>

          <!-- NOVO: Consumos -->
          <a routerLink="/consumos" routerLinkActive="text-blue-700 font-medium"
             class="hover:text-black text-gray-700">Consumos</a>
        </nav>

        <div class="flex items-center gap-3">
          <!-- Logout (placeholder) -->
          <button class="hidden md:inline-flex text-red-600 hover:text-red-700 text-sm"
                  (click)="logout()">Sair</button>

          <!-- Mobile burger -->
          <button class="md:hidden inline-flex items-center justify-center p-2 rounded hover:bg-gray-100"
                  aria-label="Abrir menu" (click)="toggleMobile()">
            <svg *ngIf="!mobileOpen()" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg *ngIf="mobileOpen()" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div *ngIf="mobileOpen()" class="md:hidden border-t bg-white">
        <nav class="px-4 py-2 grid gap-1 text-sm">
          <a routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="bg-gray-100 font-medium"
             class="px-2 py-2 rounded hover:bg-gray-50" (click)="closeMobile()">Home</a>

          <a routerLink="/clientes" routerLinkActive="bg-gray-100 font-medium"
             class="px-2 py-2 rounded hover:bg-gray-50" (click)="closeMobile()">Clientes</a>

          <a routerLink="/produtos" routerLinkActive="bg-gray-100 font-medium"
             class="px-2 py-2 rounded hover:bg-gray-50" (click)="closeMobile()">Produtos</a>

          <a routerLink="/estoque/entrada" routerLinkActive="bg-gray-100 font-medium"
             class="px-2 py-2 rounded hover:bg-gray-50" (click)="closeMobile()">Entrada de estoque</a>

          <a routerLink="/estoque/visualizar" routerLinkActive="bg-gray-100 font-medium"
             class="px-2 py-2 rounded hover:bg-gray-50" (click)="closeMobile()">Visualizar estoque</a>

          <!-- NOVO: Consumos -->
          <a routerLink="/consumos" routerLinkActive="bg-gray-100 font-medium"
             class="px-2 py-2 rounded hover:bg-gray-50" (click)="closeMobile()">Consumos</a>

          <hr class="my-2">
          <button class="text-left text-red-600 px-2 py-2 rounded hover:bg-red-50"
                  (click)="logout(); closeMobile()">Sair</button>
        </nav>
      </div>
    </header>

    <!-- Conteúdo -->
    <main class="max-w-6xl mx-auto px-4 py-6">
      <router-outlet />
    </main>
  </div>
  `,
})
export class LayoutComponent {
  private router = inject(Router);

  mobileOpen = signal(false);

  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile() { this.mobileOpen.set(false); }

  constructor() {
    // fecha o menu ao navegar
    this.router.events.subscribe(() => this.mobileOpen.set(false));
  }

  logout() {
    // TODO: limpe o token e redirecione
    // ex.: this.token.clear(); this.router.navigate(['/login']);
    this.router.navigate(['/login']);
  }
}
