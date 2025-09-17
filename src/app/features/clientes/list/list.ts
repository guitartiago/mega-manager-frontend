import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../clientes';
import { RouterLink } from '@angular/router';
import { ClienteResponseDTO } from '../clientes.model';
import { HasAnyRoleDirective, HasRoleDirective } from "../../../core/auth/has-role.directive";


@Component({
  standalone: true,
  selector: 'app-clientes-list',
  imports: [CommonModule, RouterLink, HasAnyRoleDirective, HasRoleDirective],
  template: `
  <section class="grid gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Clientes</h2>
      <a *hasAnyRole="['ADMIN', 'USER']" routerLink="/clientes/new"
         class="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Novo cliente</a>
    </div>

    <input #search class="w-full max-w-md p-2 border rounded"
           placeholder="Buscar por nome ou email..."
           [value]="q()" (input)="q.set(search.value)">

    <div class="rounded-xl border bg-white shadow-sm overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left p-3">Nome</th>
            <th class="text-left p-3">Email</th>
            <th class="text-left p-3">Celular</th>
            <th class="text-left p-3">Perfil</th>
            <th class="text-right p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of filtered()" class="border-t">
            <td class="p-3">{{ c.nome }}</td>
            <td class="p-3">{{ c.email }}</td>
            <td class="p-3">{{ formatCelular(c.celular) }}</td>
            <td class="p-3">
              <span class="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">{{ c.perfil }}</span>
            </td>
            <td class="p-3 text-right">
              <a [routerLink]="['/clientes', c.id, 'edit']" class="text-blue-600 hover:underline mr-3">Editar</a>
              <button *hasRole="'ADMIN'" (click)="confirmRemove(c)" class="text-red-600 hover:underline">Excluir</button>
            </td>
          </tr>
          <tr *ngIf="!loading() && filtered().length === 0">
            <td colspan="4" class="p-6 text-center text-gray-500">Nenhum cliente encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Modal de confirmação -->
  <div *ngIf="toDelete()" class="fixed inset-0 bg-black/40 grid place-items-center">
    <div class="bg-white rounded-xl p-6 w-full max-w-md shadow">
      <h3 class="text-lg font-semibold mb-2">Excluir cliente</h3>
      <p class="text-sm text-gray-600 mb-4">
        Tem certeza que deseja excluir <b>{{ toDelete()!.nome }}</b>?
      </p>
      <div class="flex justify-end gap-2">
        <button (click)="toDelete.set(null)" class="px-3 py-2 rounded border hover:bg-gray-50">Cancelar</button>
        <button *hasRole="'ADMIN'" (click)="remove()" class="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">Excluir</button>
      </div>
    </div>
  </div>
  `
})
export class ClientesListComponent implements OnInit {
  private svc = inject(ClientesService);

  items = signal<ClienteResponseDTO[]>([]);
  loading = signal(false);
  q = signal('');
  toDelete = signal<ClienteResponseDTO | null>(null);

  filtered = computed(() => {
    const term = this.q().toLowerCase().trim();
    if (!term) return this.items();
    return this.items().filter(c =>
      c.nome.toLowerCase().includes(term) || c.email.toLowerCase().includes(term)
    );
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list().subscribe({
      next: (res) => this.items.set(res),
      error: (e) => { console.error(e); },
      complete: () => this.loading.set(false),
    });
  }

  confirmRemove(c: ClienteResponseDTO) { this.toDelete.set(c); }

  remove() {
    const c = this.toDelete(); if (!c) return;
    this.svc.remove(c.id).subscribe({
      next: () => { this.toDelete.set(null); this.load(); },
      error: (e) => console.error(e),
    });
  }

  formatCelular(raw: string) {
    if (!raw) return '';
    if (raw.length === 8) return raw.replace(/(\d{4})(\d{4})/, '$1-$2'); // fixo sem 9
    if (raw.length === 9) return raw.replace(/(\d{5})(\d{4})/, '$1-$2'); // celular sem DDD
    if (raw.length === 10) return raw.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); // fixo com DDD
    if (raw.length === 11) return raw.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); // celular com DDD
    return raw;
  }

}
