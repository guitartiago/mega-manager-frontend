// src/app/features/consumos/consumos-home.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ConsumoService } from './consumo.service';
import { ClientesService } from '../clientes/clientes';
import { ClienteResponseDTO } from '../clientes/clientes.model';

@Component({
  standalone: true,
  selector: 'app-consumos-home',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="grid gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Consumos</h2>
      <a class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
         [routerLink]="['/consumos/novo']">
        Incluir consumo
      </a>
    </div>

    <!-- Filtro por cliente -->
    <form [formGroup]="filtro" class="max-w-md grid gap-2">
      <label class="block text-sm text-gray-600">Cliente</label>
      <select class="w-full p-2 border rounded" formControlName="clienteId">
        <option [ngValue]="null" disabled>Selecione...</option>
        <option *ngFor="let c of clientes()" [ngValue]="c.id">{{ c.nome }}</option>
      </select>
    </form>

    <!-- Card do cliente selecionado -->
    <ng-container *ngIf="selecionado() as s">
      <div class="p-4 rounded-xl border bg-white shadow-sm grid gap-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Cliente</div>
            <div class="text-lg font-semibold">{{ s.cliente!.nome }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Total em aberto</div>
            <div class="text-xl font-bold">{{ brl(s.total) }}</div>
          </div>
        </div>
        <div class="flex gap-2">
          <a class="px-3 py-2 rounded border hover:bg-gray-50"
             [routerLink]="['/consumos/novo']"
             [queryParams]="{ clienteId: s.cliente!.id }">
            Adicionar consumo
          </a>
          <a class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
             [routerLink]="['/consumos', s.cliente!.id]">
            Detalhes da conta
          </a>
        </div>
      </div>
    </ng-container>

    <!-- Lista de contas abertas -->
    <div class="grid gap-3">
      <h3 class="text-lg font-semibold">Contas abertas</h3>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div *ngFor="let card of contasAbertas()" class="p-4 rounded-xl border bg-white shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium">{{ card.cliente.nome }}</div>
            <div class="text-right font-semibold">{{ brl(card.total) }}</div>
          </div>
          <div class="flex items-center gap-2">
            <a class="px-3 py-2 rounded border hover:bg-gray-50"
               [routerLink]="['/consumos/novo']"
               [queryParams]="{ clienteId: card.cliente.id }">Adicionar</a>
            <a class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ml-auto"
               [routerLink]="['/consumos', card.cliente.id]">Detalhes</a>
          </div>
        </div>

        <p *ngIf="contasAbertas().length===0" class="text-gray-500">
          Nenhuma conta aberta encontrada.
        </p>
      </div>
    </div>
  </section>
  `,
})
export class ConsumosHomeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ConsumoService);
  private clientesSvc = inject(ClientesService);

  clientes = signal<ClienteResponseDTO[]>([]);
  filtro = this.fb.group({ clienteId: [null] });

  // >>> alteração principal: objeto reativo com os totais
  // ex: { [clienteId]: total }
  totais = signal<Record<number, number>>({});

  ngOnInit() {
    this.clientesSvc.list().subscribe({
      next: cs => {
        this.clientes.set(cs);
        // carrega totais; a cada resposta, atualiza o objeto do signal
        cs.forEach(cli => {
          this.svc.totalEmAberto(cli.id).subscribe(t => {
            this.totais.update(prev => ({ ...prev, [cli.id]: t ?? 0 }));
          });
        });
      }
    });
  }

  selecionado = computed(() => {
    const id = this.filtro.value.clienteId as number | null;
    if (!id) return null;
    const cliente = this.clientes().find(c => c.id === id) || null;
    const total = this.totais()[id] ?? 0;
    return { cliente, total };
  });

  contasAbertas = computed(() => {
    const map = this.totais();
    return this.clientes()
      .map(c => ({ cliente: c, total: map[c.id] ?? 0 }))
      .filter(x => x.total > 0)
      .sort((a, b) => b.total - a.total);
  });

  brl(n: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n ?? 0);
  }
}
