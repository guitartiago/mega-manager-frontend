import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TokenStorage } from '../../../core/auth/token-storage';
import { finalize } from 'rxjs';
import { AlertService } from '../../../shared/ui/alert/alert.service';

@Component({
  standalone: true,
  selector: 'mm-login',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="min-h-svh grid place-items-center bg-gray-100">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow p-6">
      <!-- LOGO: adicione este bloco -->
      <div class="flex justify-center mb-4">
        <img src="/assets/logo-megamanager.png"
            alt="MegaManager"
            class="w-40 md:w-56 h-auto select-none" />
      </div>


      <form (ngSubmit)="onSubmit()" class="space-y-3">
        <input class="w-full p-2 border rounded" name="username" [(ngModel)]="username" placeholder="Usuário" required />
        <input class="w-full p-2 border rounded" name="password" type="password" [(ngModel)]="password" placeholder="Senha" required />
        <button class="w-full p-2 rounded bg-blue-600 text-white hover:bg-blue-700" [disabled]="loading()">Entrar</button>
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
  private alerts = inject(AlertService);


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
          this.alerts.error('Falha no login', 'Usuário ou senha inválidos.');
          this.error.set('Falha no login.');
        },
      });
  }
}
