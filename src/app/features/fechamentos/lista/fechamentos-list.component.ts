import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { FechamentoService } from '../fechamento.service';
import { ClientesService } from '../../clientes/clientes';
import { FechamentoResumoDTO, FechamentoResponseDTO } from '../fechamento.model';
import { ClienteResponseDTO } from '../../clientes/clientes.model';
import { AlertService } from '../../../shared/ui/alert/alert.service';
import { SendEmailModalComponent } from '../send-email-modal-component';

@Component({
  standalone: true,
  selector: 'app-fechamentos-list',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SendEmailModalComponent],
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
            <th class="text-right p-3">Total (agrupado)</th>
            <th class="p-3 w-56 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let f of fechamentos()" class="border-t">
            <td class="p-3">{{ formatDateTime(f.dataHora) }}</td>
            <td class="p-3">{{ f.clienteNome }}</td>
            <td class="p-3">{{ f.usuario }}</td>
            <td class="p-3 text-right">{{ formatBRL(totalAgrupadoPorId(f.id) ?? f.total) }}</td>
            <td class="p-3 text-right whitespace-nowrap">
              <a [routerLink]="['/fechamentos', f.id]" class="text-blue-600 hover:underline mr-3">Detalhes</a>
              <button class="px-3 py-1 rounded-md border bg-black text-white"
                      (click)="abrirModalEnvio(f.id, f.clienteNome)">Enviar por e-mail</button>
            </td>
          </tr>

          <tr *ngIf="!carregando() && fechamentos().length === 0">
            <td colspan="5" class="p-6 text-center text-gray-500">Nenhum fechamento encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Modal -->
  <app-send-email-modal
    [open]="modalOpen()"
    [fechamentoId]="modalFechamentoId()!"
    [defaultEmail]="modalEmailDefault()"
    [defaultNome]="modalNomeDefault()"
    (close)="fecharModal()"
    (confirm)="confirmarEnvio($event)">
  </app-send-email-modal>
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

  /** cache: idFechamento -> total agrupado */
  private totaisAgrupados = new Map<number, number>();

  /** cache: clienteId -> email */
  private emailPorCliente = new Map<number, string>();

  // estado do modal
  modalOpen = signal(false);
  modalFechamentoId = signal<number | null>(null);
  modalEmailDefault = signal<string | null>(null);
  modalNomeDefault = signal<string | null>(null);

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
      next: r => {
        this.fechamentos.set(r);
        this.totaisAgrupados.clear();

        // para cada fechamento, busca detalhe e calcula total agrupado
        for (const row of r) {
          this.svc.get(row.id).subscribe({
            next: (det: FechamentoResponseDTO) => {
              const total = this.svc.computeTotalAgrupadoFrom(det);
              this.totaisAgrupados.set(row.id, total);
              this.fechamentos.update(x => [...x]); // re-render
            },
            error: () => { /* silencioso */ }
          });
        }
      },
      error: e => this.alerts.error('Erro', e?.error?.message || 'Falha ao buscar fechamentos.'),
      complete: () => this.carregando.set(false),
    });
  }

  limpar() {
    this.form.reset();
    this.totaisAgrupados.clear();
    this.buscar();
  }

  totalAgrupadoPorId(id: number): number | undefined {
    return this.totaisAgrupados.get(id);
  }

  abrirModalEnvio(id: number, clienteNomeLista: string) {
    // 1) pega o detalhe pra descobrir o clienteId
    this.svc.get(id).subscribe({
      next: det => {
        const clienteId = (det as any).clienteId as number; // seu DTO de detalhe tem clienteId

        // 2) tenta pegar do cache primeiro
        const cached = this.emailPorCliente.get(clienteId);
        if (cached) {
          this.modalFechamentoId.set(id);
          this.modalNomeDefault.set(det.clienteNome || clienteNomeLista || 'Cliente');
          this.modalEmailDefault.set(cached);
          this.modalOpen.set(true);
          return;
        }

        // 3) busca o cliente na base pra obter o email
        // Se o seu ClientesService tiver get(id): use
        // this.clientesSvc.get(clienteId).subscribe(...)
        //
        // Como você já tem list() carregado no init, dá pra resolver local também:
        const clienteNaLista = this.clientes().find(c => c.id === clienteId);

        if (clienteNaLista && (clienteNaLista as any).email) {
          const email = (clienteNaLista as any).email as string;
          this.emailPorCliente.set(clienteId, email);

          this.modalFechamentoId.set(id);
          this.modalNomeDefault.set(det.clienteNome || clienteNomeLista || 'Cliente');
          this.modalEmailDefault.set(email);
          this.modalOpen.set(true);
        } else {
          // fallback: tentar via serviço (caso tenha método get/id)
          if ((this.clientesSvc as any).get) {
            (this.clientesSvc as any).get(clienteId).subscribe({
              next: (cli: any) => {
                const email = cli?.email ?? '';
                if (email) this.emailPorCliente.set(clienteId, email);

                this.modalFechamentoId.set(id);
                this.modalNomeDefault.set(det.clienteNome || clienteNomeLista || (cli?.nome ?? 'Cliente'));
                this.modalEmailDefault.set(email || null);
                this.modalOpen.set(true);
              },
              error: () => {
                // abre sem e-mail se não conseguir buscar
                this.modalFechamentoId.set(id);
                this.modalNomeDefault.set(det.clienteNome || clienteNomeLista || 'Cliente');
                this.modalEmailDefault.set(null);
                this.modalOpen.set(true);
              }
            });
          } else {
            // último fallback: abre sem e-mail
            this.modalFechamentoId.set(id);
            this.modalNomeDefault.set(det.clienteNome || clienteNomeLista || 'Cliente');
            this.modalEmailDefault.set(null);
            this.modalOpen.set(true);
          }
        }
      },
      error: e => this.alerts.error('Erro', e?.error?.message || 'Falha ao obter cliente do fechamento.'),
    });
  }


  fecharModal() {
    this.modalOpen.set(false);
  }

  confirmarEnvio(evt: { email: string; nome: string; anexar: boolean }) {
    const id = this.modalFechamentoId();
    if (!id) return;

    const send = (valor: number) => {
      const descricao = `Fechamento #${id} - ${evt.nome}`;
      this.svc.enviarContaPorEmail(evt.email, evt.nome, valor, descricao, evt.anexar).subscribe({
        next: () => {
          this.alerts.success('E-mail enviado', `Conta enviada para ${evt.email}`);
          this.fecharModal();
        },
        error: e => this.alerts.error('Erro', e?.error?.message || 'Falha ao enviar e-mail.'),
      });
    };

    const total = this.totaisAgrupados.get(id);
    if (typeof total === 'number') {
      send(total);
    } else {
      this.svc.get(id).subscribe({
        next: det => send(this.svc.computeTotalAgrupadoFrom(det)),
        error: e => this.alerts.error('Erro', e?.error?.message || 'Falha ao obter total do fechamento.'),
      });
    }
  }

  formatDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString();
  }

  formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
