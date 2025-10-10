import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConsumoService } from './consumo.service';
import { DetalheContaDTO, ItemConsumoDTO } from './consumo.model';
import { FechamentoService } from '../fechamentos/fechamento.service';
import { AlertService } from '../../shared/ui/alert/alert.service';

type LinhaAgg = {
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
};

type GrupoDiaAgg = { data: string; linhas: LinhaAgg[]; subtotal: number };

@Component({
  standalone: true,
  selector: 'app-conta-detalhes',
  imports: [CommonModule, RouterLink],
  template: `
  <section class="grid gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Detalhes da conta</h2>
      <a routerLink="/consumos" class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">← Voltar</a>
    </div>

    <div *ngIf="conta()" class="p-4 rounded-xl border bg-white shadow-sm">
      <div class="grid md:grid-cols-3 gap-3">
        <div>
          <div class="text-sm text-gray-500">Cliente</div>
          <div class="text-lg font-semibold">{{ conta()!.nomeCliente }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">Perfil</div>
          <div class="text-lg">{{ conta()!.perfil }}</div>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-500">Total em aberto</div>
          <div class="text-2xl font-bold">{{ brl(conta()!.total) }}</div>
        </div>
      </div>

      <div class="mt-3 flex gap-2">
        <a class="px-3 py-2 rounded border hover:bg-gray-50"
            [routerLink]="['/consumos/novo']"
            [queryParams]="{ clienteId: conta()?.clienteId }">
          Adicionar consumo
        </a>
        <button
          class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 ml-auto"
          [disabled]="fechando() || !conta() || conta()!.itens.length === 0"
          (click)="confirmarFechamento()">
          {{ fechando() ? 'Processando...' : 'Fechar conta' }}
        </button>
      </div>
    </div>

    <div class="rounded-xl border bg-white shadow-sm overflow-x-auto" *ngIf="conta() && conta()!.itens.length">
      <div *ngFor="let g of grupos()" class="border-b last:border-0">
        <div class="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-medium">
          {{ g.data }} <span class="float-right">Subtotal: {{ brl(g.subtotal) }}</span>
        </div>
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="text-left p-3 w-1/2">Produto</th>
              <th class="text-center p-3 w-1/12">Qtd</th>
              <th class="text-right p-3 w-1/6">VU</th>
              <th class="text-right p-3 w-1/6">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let l of g.linhas" class="border-t">
              <td class="p-3">{{ l.nomeProduto }}</td>
              <td class="p-3 text-center">{{ l.quantidade }}</td>
              <td class="p-3 text-right">{{ brl(l.valorUnitario) }}</td>
              <td class="p-3 text-right font-medium">{{ brl(l.valorTotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p *ngIf="!carregando() && conta() && conta()!.itens.length===0" class="text-gray-500">
      Nenhum consumo em aberto para este cliente.
    </p>

    <p *ngIf="sucesso()" class="text-green-700">Conta fechada com sucesso.</p>
    <p *ngIf="erro()" class="text-red-600">{{ erro() }}</p>
  </section>
  `,
})
export class ContaDetalhesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(ConsumoService);
  private fechamentoSvc = inject(FechamentoService);
  private alerts = inject(AlertService);
  private router = inject(Router);

  clienteId!: number;
  conta = signal<DetalheContaDTO | null>(null);
  carregando = signal(false);
  fechando = signal(false);
  sucesso = signal(false);
  erro = signal<string | null>(null);

  ngOnInit() {
    this.clienteId = Number(this.route.snapshot.paramMap.get('clienteId'));
    this.reload();
  }

  reload() {
    this.carregando.set(true);
    this.svc.detalharConta(this.clienteId).subscribe({
      next: res => this.conta.set(res),
      error: e => { console.error(e); this.carregando.set(false); },
      complete: () => this.carregando.set(false),
    });
  }

  /** grupos agregados por dia + produto */
  grupos = computed<GrupoDiaAgg[]>(() => {
    const c = this.conta();
    if (!c) return [];

    const byDay: Record<string, LinhaAgg[]> = {};

    for (const i of c.itens as ItemConsumoDTO[]) {
      const day = (i.dataHora ?? '').slice(0, 10);
      const key = `${i.nomeProduto}__${i.valorUnitario}`;

      if (!byDay[day]) byDay[day] = [];

      let linha = byDay[day].find(l => `${l.nomeProduto}__${l.valorUnitario}` === key);
      if (!linha) {
        linha = {
          nomeProduto: i.nomeProduto,
          quantidade: 0,
          valorUnitario: i.valorUnitario,
          valorTotal: 0,
        };
        byDay[day].push(linha);
      }

      linha.quantidade += i.quantidade ?? 0;
      linha.valorTotal += i.valorTotal ?? (i.quantidade ?? 0) * (i.valorUnitario ?? 0);
    }

    return Object.entries(byDay)
      .sort((a, b) => b[0].localeCompare(a[0])) // datas desc
      .map(([day, linhas]) => {
        linhas.sort((a, b) => a.nomeProduto.localeCompare(b.nomeProduto));
        const subtotal = linhas.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        return {
          data: this.formatDate(day),
          linhas,
          subtotal,
        };
      });
  });

  confirmarFechamentoOld() {
    if (!confirm('Confirmar fechamento (pagamento) de toda a conta deste cliente?')) return;
    this.fechando.set(true); this.sucesso.set(false); this.erro.set(null);
    this.fechamentoSvc.fechar(this.clienteId).subscribe({
      next: () => { this.sucesso.set(true); this.reload(); },
      error: e => { console.error(e); this.erro.set('Falha ao fechar a conta.'); },
      complete: () => this.fechando.set(false),
    });
  }

  confirmarFechamento() {
    if (!confirm('Confirmar fechamento (pagamento) de toda a conta deste cliente?')) return;

    this.sucesso.set(false);
    this.erro.set(null);
    this.fechando.set(true);

    this.fechamentoSvc.fechar(this.clienteId).subscribe({
      next: (resp) => {
        this.sucesso.set(true);
        this.alerts.success('Conta fechada', `Total: R$ ${resp.total.toFixed(2)}`);
        // redireciona para detalhe do fechamento
        this.router.navigate(['/fechamentos', resp.id]);
      },
      error: (e) => {
        console.error(e);
        this.erro.set('Falha ao fechar a conta.');
        this.alerts.error('Erro', e?.error?.message || 'Falha ao fechar a conta.');
      },
      complete: () => this.fechando.set(false),
    });
  }

  brl(n: number) {
    return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL'}).format(n ?? 0);
  }

  private formatDate(yyyyMMdd: string) {
    const [y, m, d] = yyyyMMdd.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}
