import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  Validators,
  AbstractControl,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ClientesService } from '../clientes/clientes';
import { ProdutosService } from '../produtos/produtos.service';
import { ConsumoService } from './consumo.service';

import { ClienteResponseDTO } from '../clientes/clientes.model';
import { ProdutoResponseDTO } from '../produtos/produto.model';
import { AlertService } from '../../shared/ui/alert/alert.service';

type ItemForm = FormGroup<{
  clienteId: any;
  produtoId: any;
  quantidade: any;
}>;

@Component({
  standalone: true,
  selector: 'app-registrar-consumo',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="grid gap-4 max-w-5xl">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Registrar consumo</h2>
      <a routerLink="/consumos" class="text-sm text-blue-600 hover:underline">← Voltar</a>
    </div>

    <p class="text-sm text-gray-600">
      Adicione um ou mais lançamentos. Você pode alterar o cliente em cada card.
    </p>

    <form [formGroup]="form" class="grid gap-4">
      <!-- CARDS -->
      <div formArrayName="itens" class="grid gap-4">
        <div *ngFor="let _ of itens.controls; let i = index"
             [formGroupName]="i"
             class="grid gap-3 p-4 rounded-xl border bg-white shadow-sm">
          <div class="text-sm text-gray-500 font-medium mb-1">
            Lançamento #{{ i + 1 }}
          </div>

          <div class="grid md:grid-cols-3 gap-3">
            <!-- Cliente -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">Cliente *</label>
              <select class="w-full p-2 border rounded" formControlName="clienteId">
                <option [ngValue]="null" disabled>Selecione...</option>
                <option *ngFor="let c of clientes()" [ngValue]="c.id">{{ c.nome }}</option>
              </select>
              <p class="text-xs text-red-600 mt-1"
                 *ngIf="controlAt(i,'clienteId')?.touched && controlAt(i,'clienteId')?.invalid">
                Selecione um cliente.
              </p>
            </div>

            <!-- Produto -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">Produto *</label>
              <select class="w-full p-2 border rounded" formControlName="produtoId">
                <option [ngValue]="null" disabled>Selecione...</option>
                <option *ngFor="let p of produtosAtivos()" [ngValue]="p.id">{{ p.nome }}</option>
              </select>
              <p class="text-xs text-red-600 mt-1"
                 *ngIf="controlAt(i,'produtoId')?.touched && controlAt(i,'produtoId')?.invalid">
                Selecione um produto.
              </p>
            </div>

            <!-- Quantidade -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">Quantidade *</label>
              <input type="number" min="1" class="w-full p-2 border rounded" formControlName="quantidade">
              <p class="text-xs text-red-600 mt-1"
                 *ngIf="controlAt(i,'quantidade')?.touched && controlAt(i,'quantidade')?.invalid">
                Informe uma quantidade válida (≥ 1).
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end">
            <button type="button"
                    class="px-3 py-2 rounded border hover:bg-gray-50"
                    (click)="removeItem(i)"
                    *ngIf="itens.length > 1">
              Remover
            </button>
          </div>
        </div>
      </div>

      <!-- AÇÕES -->
      <div class="flex items-center gap-2">
        <button type="button"
                class="px-3 py-2 rounded border hover:bg-gray-50"
                (click)="addItem()">
          Adicionar card
        </button>

        <button type="button"
                class="ml-auto px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                [disabled]="salvando()"
                (click)="salvar()">
          {{ salvando() ? 'Salvando...' : 'Salvar tudo' }}
        </button>
      </div>
    </form>
  </section>
  `,
})
export class RegistrarConsumoComponent implements OnInit {
  // services & helpers
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private clientesSvc = inject(ClientesService);
  private produtosSvc = inject(ProdutosService);
  private consumoSvc = inject(ConsumoService);
  private alerts = inject(AlertService);

  // data
  clientes = signal<ClienteResponseDTO[]>([]);
  produtos = signal<ProdutoResponseDTO[]>([]);
  produtosAtivos = () => this.produtos().filter(p => p.ativo);

  // ui
  salvando = signal(false);

  // form root
  form = this.fb.group({
    itens: this.fb.array<ItemForm>([])
  });

  get itens(): FormArray<ItemForm> {
    return this.form.get('itens') as FormArray<ItemForm>;
  }

  ngOnInit(): void {
    // carrega selects
    this.clientesSvc.list().subscribe({ next: c => this.clientes.set(c) });
    this.produtosSvc.list().subscribe({ next: p => this.produtos.set(p) });

    // cliente pré-selecionado (se vier do card)
    const pre = Number(this.route.snapshot.queryParamMap.get('clienteId')) || null;

    // inicia com 1 card
    this.itens.push(this.novoItem(pre));
  }

  /** cria um form de item com defaults */
  private novoItem(clienteId: number | null = null): ItemForm {
    return this.fb.group({
      clienteId: [clienteId, Validators.required],
      produtoId: [null, Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
    }) as ItemForm;
  }

  addItem(): void {
    // ao adicionar mais cards, se houver cliente selecionado no 1º, reusa como comodidade
    const raw = this.itens.length > 0 ? this.itens.at(0).get('clienteId')?.value : null;
    const reuseClient: number | null = typeof raw === 'number' ? raw : null;
    this.itens.push(this.novoItem(reuseClient));
  }

  removeItem(ix: number): void {
    if (this.itens.length > 1) this.itens.removeAt(ix);
  }

  controlAt(ix: number, name: 'clienteId'|'produtoId'|'quantidade'): AbstractControl | null {
    return (this.itens.at(ix) as FormGroup).get(name);
  }

  salvar(): void {
    // validação
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alerts.warn('Revise os campos', 'Preencha cliente, produto e quantidade em todos os cards.');
      return;
    }

    const payload = this.itens.controls
      .map(ctrl => ctrl.getRawValue())
      .filter(v => !!v && v.clienteId && v.produtoId && v.quantidade)
      .map(v => ({
        clienteId: Number(v.clienteId),
        produtoId: Number(v.produtoId),
        quantidade: Number(v.quantidade),
      }));

    if (!payload.length) {
      this.alerts.warn('Nenhum lançamento válido', 'Adicione pelo menos um card completo.');
      return;
    }

    this.salvando.set(true);

    this.consumoSvc.registrarVarios(payload).subscribe({
      next: () => {
        this.alerts.success('Consumos registrados com sucesso!');
        this.router.navigate(['/consumos']);
      },
      error: (err) => {
        console.error(err);
        this.salvando.set(false);
        // marca inválidos visualmente (caso backend detalhe qual falhou você pode mapear aqui)
        this.form.markAllAsTouched();
        const msg = err?.error?.message || 'Não foi possível registrar consumos. Corrija os campos e tente novamente.';
        this.alerts.error('Erro ao salvar', msg);
      },
      complete: () => this.salvando.set(false),
    });
  }
}
