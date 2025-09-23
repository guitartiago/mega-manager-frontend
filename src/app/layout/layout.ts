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
          <a routerLink="/" routerLinkActive="text-blue-600 font-semibold" class="hover:text-black">Home</a>
          <a routerLink="/clientes" routerLinkActive="text-blue-600 font-semibold" class="hover:text-black">Clientes</a>
          <a routerLink="/produtos" routerLinkActive="text-blue-600 font-semibold" class="hover:text-black">Produtos</a>
          <a routerLink="/estoque/entrada" routerLinkActive="text-blue-600 font-semibold" class="hover:text-black">Entrada de estoque</a>
          <a routerLink="/estoque/visualizar" routerLinkActive="text-blue-600 font-semibold" class="hover:text-black">Visualizar estoque</a>

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
