import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TokenStorage } from '../core/auth/token-storage';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-svh bg-gray-50">
      <!-- Header -->
      <header class="h-14 px-4 flex items-center justify-between bg-white shadow">
        <div class="font-semibold text-lg">MegaManager</div>

        <nav class="flex items-center space-x-6 text-sm text-gray-600">
          <!-- Home -->
          <a routerLink="/"
             routerLinkActive="text-blue-600 border-b-2 border-blue-600"
             [routerLinkActiveOptions]="{ exact: true }"
             class="flex items-center gap-1 hover:text-black transition-colors pb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 
                    .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504
                     1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>

            Home
          </a>

          <!-- Clientes -->
          <a routerLink="/clientes"
             routerLinkActive="text-blue-600 border-b-2 border-blue-600"
             class="flex items-center gap-1 hover:text-black transition-colors pb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5.121 17.804A9.969 9.969 0 0112 15c2.21 0 4.243.72 5.879 1.929M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Clientes
          </a>

          <!-- Produtos -->
          <a routerLink="/produtos"
             routerLinkActive="text-blue-600 border-b-2 border-blue-600"
             class="flex items-center gap-1 hover:text-black transition-colors pb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 13V6a2 2 0 00-2-2h-5v4H5v2h8v3h5a2 2 0 002-2z" />
            </svg>
            Produtos
          </a>

          <!-- Logout -->
          <button (click)="logout()" type="button"
                  class="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors pb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sair
          </button>
        </nav>
      </header>

      <!-- Conteúdo -->
      <main class="p-4 max-w-6xl mx-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutComponent {
  private token = inject(TokenStorage);
  private router = inject(Router);

  logout() {
    this.token.clear();
    this.router.navigateByUrl('/login');
  }
}
