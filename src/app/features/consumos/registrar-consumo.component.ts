import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ConsumoService } from './consumo.service';
import { ClientesService } from '../clientes/clientes';
import { ProdutosService } from '../produtos/produtos.service';
import { ClienteResponseDTO } from '../clientes/clientes.model';
import { ProdutoResponseDTO } from '../produtos/produto.model';

@Component({
  standalone: true,
  selector: 'app-registrar-consumo',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="grid gap-4 max-w-3xl">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Incluir consumo</h2>
      <a routerLink="/consumos" class="text-sm text-blue-600 hover:underline">← Voltar</a>
    </div>

    <form [formGroup]="form" class="grid md:grid-cols-3 gap-3">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Cliente *</label>
        <select class="w-full p-2 border rounded" formControlName="clienteId">
          <option [ngValue]="null" disabled>Selecione...</option>
          <option *ngFor="let c of clientes()" [ngValue]="c.id">{{ c.nome }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1">Produto *</label>
        <select class="w-full p-2 border rounded" formControlName="produtoId">
          <option [ngValue]="null" disabled>Selecione...</option>
          <option *ngFor="let p of produtos()" [ngValue]="p.id">{{ p.nome }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1">Quantidade *</label>
        <input type="number" min="1" class="w-full p-2 border rounded" formControlName="quantidade">
      </div>
    </form>

    <div class="flex items-center gap-2">
      <button class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              [disabled]="form.invalid || salvando()"
              (click)="salvar()">
        {{ salvando() ? 'Salvando...' : 'Adicionar' }}
      </button>
    </div>

    <p *ngIf="sucesso()" class="text-green-700">Consumo adicionado.</p>
    <p *ngIf="erro()" class="text-red-600">{{ erro() }}</p>
  </section>
  `,
})
export class RegistrarConsumoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ConsumoService);
  private clientesSvc = inject(ClientesService);
  private produtosSvc = inject(ProdutosService);

  clientes = signal<ClienteResponseDTO[]>([]);
  produtos = signal<ProdutoResponseDTO[]>([]);

  salvando = signal(false);
  sucesso = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.group({
    clienteId: [null as number | null, Validators.required],
    produtoId: [null as number | null, Validators.required],
    quantidade: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    this.clientesSvc.list().subscribe({ next: c => this.clientes.set(c) });
    this.produtosSvc.list().subscribe({ next: p => this.produtos.set(p.filter(x => x.ativo)) });

    const pre = Number(this.route.snapshot.queryParamMap.get('clienteId'));
    if (pre) this.form.patchValue({ clienteId: pre });
  }

  salvar() {
    const { clienteId, produtoId, quantidade } = this.form.getRawValue();
    if (!clienteId || !produtoId || !quantidade) return;

    this.salvando.set(true); this.sucesso.set(false); this.erro.set(null);
    this.svc.registrar({ clienteId, produtoId, quantidade }).subscribe({
      next: () => { this.sucesso.set(true); this.form.patchValue({ produtoId: null, quantidade: 1 }); },
      error: e => { console.error(e); this.erro.set('Falha ao registrar consumo.'); },
      complete: () => this.salvando.set(false),
    });
  }
}
