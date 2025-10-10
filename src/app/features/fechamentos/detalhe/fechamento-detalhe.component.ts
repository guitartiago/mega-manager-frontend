import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FechamentoService } from '../fechamento.service';
import { FechamentoResponseDTO } from '../fechamento.model';
import { AlertService } from '../../../shared/ui/alert/alert.service';

@Component({
  standalone: true,
  selector: 'app-fechamento-detalhe',
  imports: [CommonModule, RouterLink],
  template: `
  <section class="grid gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Fechamento #{{ dados()?.id }}</h2>
      <a routerLink="/fechamentos" class="text-sm text-blue-600 hover:underline">← Voltar</a>
    </div>

    <div *ngIf="dados() as d" class="grid md:grid-cols-4 gap-3 p-4 rounded-xl border bg-white shadow-sm">
      <div>
        <div class="text-sm text-gray-500">Cliente</div>
        <div class="text-lg font-semibold">{{ d.clienteNome }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Usuário</div>
        <div class="text-lg font-semibold">{{ d.usuario }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Data/Hora</div>
        <div class="text-lg font-semibold">{{ formatDateTime(d.dataHora) }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Total</div>
        <div class="text-lg font-semibold">{{ formatBRL(d.total) }}</div>
      </div>
    </div>

    <div class="rounded-xl border bg-white shadow-sm overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left p-3">Produto</th>
            <th class="text-right p-3">Qtd</th>
            <th class="text-right p-3">V. Unit.</th>
            <th class="text-right p-3">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let i of dados()?.itens" class="border-t">
            <td class="p-3">{{ i.nomeProduto }}</td>
            <td class="p-3 text-right">{{ i.quantidade }}</td>
            <td class="p-3 text-right">{{ formatBRL(i.valorUnitario) }}</td>
            <td class="p-3 text-right">{{ formatBRL(i.valorTotal) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  `,
})
export class FechamentoDetalheComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(FechamentoService);
  private alerts = inject(AlertService);

  dados = signal<FechamentoResponseDTO | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.svc.get(id).subscribe({
      next: d => this.dados.set(d),
      error: e => this.alerts.error('Erro', e?.error?.message || 'Falha ao carregar fechamento.'),
    });
  }

  formatDateTime(iso: string) {
    return new Date(iso).toLocaleString();
  }
  formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
