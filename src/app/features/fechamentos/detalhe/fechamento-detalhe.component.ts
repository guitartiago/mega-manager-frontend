import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { FechamentoService } from '../fechamento.service';
import { FechamentoResponseDTO, ItemFechamentoDTO } from '../fechamento.model';
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
        <div class="text-lg font-semibold break-words">{{ d.clienteNome }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Usuário</div>
        <div class="text-lg font-semibold break-words">{{ d.usuario }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Data/Hora</div>
        <div class="text-lg font-semibold break-words">{{ formatDateTime(d.dataHora) }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Total</div>
        <div class="text-lg font-semibold">{{ formatBRL(totalAgrupado()) }}</div>
      </div>
    </div>

    <!-- Tabela única, simples e responsiva -->
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
          <tr *ngFor="let i of itensAgrupados()" class="border-t">
            <td class="p-3 break-words">{{ i.nomeProduto }}</td>
            <td class="p-3 text-right">{{ i.quantidade }}</td>
            <td class="p-3 text-right">{{ formatBRL(i.valorUnitario) }}</td>
            <td class="p-3 text-right">{{ formatBRL(i.valorTotal) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t bg-gray-50">
            <th colspan="3" class="p-3 text-right font-semibold">Total</th>
            <th class="p-3 text-right font-semibold">{{ formatBRL(totalAgrupado()) }}</th>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Pix minimalista -->
    <div class="rounded-xl border bg-white shadow-sm p-4">
      <h3 class="text-lg font-semibold mb-2">Pagamento via Pix</h3>

      <div class="grid gap-4 md:grid-cols-[260px_1fr]">
        <div class="flex items-center justify-center bg-gray-50 rounded-md border p-2">
          <img *ngIf="qrCodeUrl()" [src]="qrCodeUrl()!" alt="QR Code Pix" width="240" height="240" class="rounded-md">
        </div>

        <div>
          <label class="text-sm text-gray-600">Pix (copia e cola)</label>
          <div class="relative max-w-[350px] w-full mx-auto">
            <pre class="whitespace-pre-wrap break-words bg-gray-50 border rounded-md p-3 max-h-56 overflow-auto pr-16">
              {{ pixPayload() || '' }}</pre>
            <button type="button"
                    class="absolute top-2 right-2 px-3 py-1.5 rounded-md border bg-black text-white disabled:opacity-60"
                    [disabled]="!pixPayload()" (click)="copiarPayload()">Copiar</button>
          </div>
        </div>
      </div>
    </div>
  </section>
  `,
})
export class FechamentoDetalheComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private svc = inject(FechamentoService);
  private alerts = inject(AlertService);

  dados = signal<FechamentoResponseDTO | null>(null);
  itensAgrupados = signal<ItemFechamentoDTO[]>([]);
  totalAgrupado = signal<number>(0);
  qrCodeUrl = signal<string | null>(null);
  pixPayload = signal<string | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.svc.get(id).subscribe({
      next: d => {
        this.dados.set(d);

        // Agrupar por nomeProduto (se preferir, troque a chave para produtoId)
        const map = new Map<string, ItemFechamentoDTO>();
        for (const it of d.itens ?? []) {
          const key = (it.nomeProduto || '').trim().toLowerCase();
          if (!map.has(key)) {
            map.set(key, { ...it });
          } else {
            const acc = map.get(key)!;
            acc.quantidade += it.quantidade;
            acc.valorTotal += it.valorTotal;
            // Se quiser recalcular o valorUnitario médio:
            // acc.valorUnitario = acc.valorTotal / acc.quantidade;
          }
        }
        const itens = Array.from(map.values());
        this.itensAgrupados.set(itens);

        // Total recalculado
        const total = itens.reduce((s, i) => s + i.valorTotal, 0);
        this.totalAgrupado.set(total);

        // Pix (usa o total agrupado)
        const descricao = `Fechamento #${d.id}`;
        this.svc.getPixQrCode(total, descricao).subscribe({ next: url => this.qrCodeUrl.set(url) });
        this.svc.getPixPayload(total, descricao).subscribe({ next: p => this.pixPayload.set(p) });
      },
      error: e => this.alerts.error('Erro', e?.error?.message || 'Falha ao carregar fechamento.'),
    });
  }

  copiarPayload() {
    const p = this.pixPayload();
    if (!p) return;
    navigator.clipboard.writeText(p);
    this.alerts.success('Pix', 'Código “copia e cola” copiado.');
  }

  ngOnDestroy(): void {
    const url = this.qrCodeUrl();
    if (url) {
      try { URL.revokeObjectURL(url); } catch {}
    }
  }

  formatDateTime(iso: string) {
    return new Date(iso).toLocaleString();
  }
  formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
