import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

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
        <div class="text-lg font-semibold">{{ formatBRL(totalAgrupado()) }}</div>
      </div>
    </div>

    <!-- Tabela com ITENS AGRUPADOS -->
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
            <td class="p-3">{{ i.nomeProduto }}</td>
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

    <!-- PIX -->
    <div class="rounded-xl border bg-white shadow-sm p-4">
      <h3 class="text-lg font-semibold">Pagamento via Pix</h3>
      <p class="text-sm text-gray-500">Escaneie o QR Code ou use o “copia e cola”.</p>

      <div class="grid md:grid-cols-[260px_1fr] gap-4 mt-3">
        <div class="flex items-center justify-center bg-gray-50 rounded-md border">
          <img *ngIf="qrCodeUrl()" [src]="qrCodeUrl()" alt="QR Code Pix" width="240" height="240" class="m-2">
        </div>

        <div>
          <label class="text-sm text-gray-600">Pix (copia e cola)</label>
          <pre class="whitespace-pre-wrap break-words bg-gray-50 border rounded-md p-2 max-h-60 overflow-auto">{{ pixPayload() }}</pre>
          <button type="button"
                  class="mt-2 px-3 py-2 rounded-md border bg-black text-white"
                  (click)="copiarPayload()">Copiar</button>
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
  private sanitizer = inject(DomSanitizer);

  dados = signal<FechamentoResponseDTO | null>(null);

  // novos signals
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
        // 1) AGRUPAR por mesmo nomeProduto (descrição)
        const agrup = new Map<string, ItemFechamentoDTO>();
        for (const it of d.itens ?? []) {
          const key = String(it.produtoId);
          if (!agrup.has(key)) {
            // clona base
            agrup.set(key, { ...it });
          } else {
            const acc = agrup.get(key)!;
            acc.quantidade += it.quantidade;
            acc.valorTotal += it.valorTotal;
            // mantém valorUnitario do primeiro; se quiser recalcular:
            // acc.valorUnitario = acc.valorTotal / acc.quantidade;
          }
        }
        const itens = Array.from(agrup.values());
        this.itensAgrupados.set(itens);

        // 2) recalcular total
        const total = itens.reduce((s, i) => s + i.valorTotal, 0);
        this.totalAgrupado.set(total);

        // 3) carregar PIX com o total agrupado
        const descricao = `Fechamento #${d.id}`;
        this.svc.getPixQrCode(total, descricao).subscribe(url => {
          // sanitiza e armazena
          this.qrCodeUrl.set(this.sanitizer.bypassSecurityTrustUrl(url) as unknown as string);
        });
        this.svc.getPixPayload(total, descricao).subscribe(payload => {
          this.pixPayload.set(payload);
        });
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
      try { URL.revokeObjectURL(url as unknown as string); } catch {}
    }
  }

  formatDateTime(iso: string) {
    return new Date(iso).toLocaleString();
  }
  formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
