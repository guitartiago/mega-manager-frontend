import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TokenStorage } from '../../../core/auth/token-storage';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'mm-login',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="min-h-svh grid place-items-center bg-gray-100">
    <div class="w-full max-w-sm bg-white p-6 rounded-2xl shadow">
      <h1 class="text-2xl font-bold mb-4 text-center">MegaManager</h1>
      <form (ngSubmit)="onSubmit()" class="space-y-3">
        <input class="w-full p-2 border rounded" [(ngModel)]="username" name="username" placeholder="Usuário" required>
        <input class="w-full p-2 border rounded" [(ngModel)]="password" name="password" type="password" placeholder="Senha" required>
        <button class="w-full p-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" [disabled]="loading()">Entrar</button>
        <p *ngIf="error()" class="text-sm text-red-600 text-center">{{ error() }}</p>
      </form>
    </div>
  </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private token = inject(TokenStorage);
  private router = inject(Router);

  username = ''; password = '';
  loading = signal(false); error = signal<string | null>(null);

  constructor() {
    if (inject(TokenStorage).isLoggedIn()) {
      inject(Router).navigate(['/']);
    }
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    this.auth.login({ username: this.username, password: this.password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => { this.token.set(res.token); this.router.navigateByUrl('/'); },
        error: (err) => { 
          console.error(err);
          this.error.set('Falha no login.');
        },
      });
  }
}
