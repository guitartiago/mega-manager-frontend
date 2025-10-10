import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { FechamentoService } from '../fechamento.service';
import { ClientesService } from '../../clientes/clientes';
import { FechamentoResumoDTO } from '../fechamento.model';
import { ClienteResponseDTO } from '../../clientes/clientes.model';
import { AlertService } from '../../../shared/ui/alert/alert.service';

@Component({
  standalone: true,
  selector: 'app-fechamentos-list',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="grid gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Fechamentos</h2>
      <a routerLink="/consumos" class="text-sm text-blue-600 hover:underline">← Ir para Consumos</a>
    </div>

    <form [formGroup]="form" class="grid md:grid-cols-4 gap-3 p-4 rounded-xl border bg-white shadow-sm">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Cliente</label>
        <select formControlName="clienteId" class="w-full p-2 border rounded">
          <option [ngValue]="null">Todos</option>
          <option *ngFor="let c of clientes()" [ngValue]="c.id">{{ c.nome }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">De</label>
        <input type="date" formControlName="de" class="w-full p-2 border rounded">
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Até</label>
        <input type="date" formControlName="ate" class="w-full p-2 border rounded">
      </div>
      <div class="flex items-end gap-2">
        <button type="button" class="px-3 py-2 rounded border hover:bg-gray-50" (click)="limpar()">Limpar</button>
        <button type="button" class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" (click)="buscar()">Buscar</button>
      </div>
    </form>

    <div class="rounded-xl border bg-white shadow-sm overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left p-3">Data/Hora</th>
            <th class="text-left p-3">Cliente</th>
            <th class="text-left p-3">Usuário</th>
            <th class="text-right p-3">Total</th>
            <th class="p-3 w-24"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let f of fechamentos()" class="border-t">
            <td class="p-3">{{ formatDateTime(f.dataHora) }}</td>
            <td class="p-3">{{ f.clienteNome }}</td>
            <td class="p-3">{{ f.usuario }}</td>
            <td class="p-3 text-right">{{ formatBRL(f.total) }}</td>
            <td class="p-3 text-right">
              <a [routerLink]="['/fechamentos', f.id]" class="text-blue-600 hover:underline">Detalhes</a>
            </td>
          </tr>
          <tr *ngIf="!carregando() && fechamentos().length === 0">
            <td colspan="5" class="p-6 text-center text-gray-500">Nenhum fechamento encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  `,
})
export class FechamentosListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(FechamentoService);
  private clientesSvc = inject(ClientesService);
  private alerts = inject(AlertService);

  clientes = signal<ClienteResponseDTO[]>([]);
  fechamentos = signal<FechamentoResumoDTO[]>([]);
  carregando = signal(false);

  form = this.fb.group({
    clienteId: [null as number | null],
    de: [''],
    ate: [''],
  });

  ngOnInit() {
    this.clientesSvc.list().subscribe({ next: c => this.clientes.set(c) });
    this.buscar(); // carrega inicial
  }

  buscar() {
    this.carregando.set(true);
    const { clienteId, de, ate } = this.form.getRawValue();
    const d = de ? `${de}T00:00:00` : undefined;
    const a = ate ? `${ate}T23:59:59` : undefined;

    this.svc.list({ clienteId: clienteId ?? undefined, de: d, ate: a }).subscribe({
      next: r => this.fechamentos.set(r),
      error: e => this.alerts.error('Erro', e?.error?.message || 'Falha ao buscar fechamentos.'),
      complete: () => this.carregando.set(false),
    });
  }

  limpar() {
    this.form.reset();
    this.buscar();
  }

  formatDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString();
    // se preferir: return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short'}).format(d);
  }

  formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
