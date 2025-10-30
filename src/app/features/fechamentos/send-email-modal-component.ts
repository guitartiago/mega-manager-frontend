import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-send-email-modal',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div *ngIf="open" class="fixed inset-0 z-50">
    <!-- backdrop -->
    <div class="absolute inset-0 bg-black/40" (click)="onClose()"></div>

    <!-- dialog -->
    <div class="absolute inset-0 flex items-center justify-center p-4" (click)="onClose()">
      <div class="w-full max-w-md rounded-xl bg-white shadow-xl border" (click)="$event.stopPropagation()">
        <div class="px-5 py-4 border-b">
          <h3 class="text-lg font-semibold">Enviar conta por e-mail</h3>
          <p class="text-sm text-gray-500 mt-1">
            Fechamento <span class="font-medium">#{{ fechamentoId }}</span>
          </p>
        </div>

        <form [formGroup]="form" class="px-5 py-4 grid gap-3">
          <div>
            <label class="block text-sm text-gray-600 mb-1">E-mail do cliente</label>
            <input type="email" formControlName="email" class="w-full p-2 border rounded"
                   placeholder="cliente@exemplo.com" />
            <div class="mt-1 text-xs text-red-600" *ngIf="form.controls.email.touched && form.controls.email.invalid">
              Informe um e-mail válido.
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-1">Nome do cliente</label>
            <input type="text" formControlName="nome" class="w-full p-2 border rounded" />
            <div class="mt-1 text-xs text-red-600" *ngIf="form.controls.nome.touched && form.controls.nome.invalid">
              Informe o nome do cliente.
            </div>
          </div>

          <label class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" formControlName="anexar" class="h-4 w-4 border rounded">
            Anexar QR (PNG) e Pix (TXT) ao e-mail
          </label>
        </form>

        <div class="px-5 py-4 border-t flex justify-end gap-2">
          <button type="button" class="px-3 py-2 rounded border hover:bg-gray-50" (click)="onClose()">Cancelar</button>
          <button type="button" class="px-3 py-2 rounded bg-black text-white disabled:opacity-60"
                  [disabled]="form.invalid || loading"
                  (click)="onConfirm()">
            {{ loading ? 'Enviando…' : 'Enviar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  `,
})
export class SendEmailModalComponent {
  private fb = inject(FormBuilder);

  @Input() open = false;
  @Input() fechamentoId!: number;

  @Input() set defaultEmail(v: string | null) {
    if (v) this.form.patchValue({ email: v });
  }
  @Input() set defaultNome(v: string | null) {
    if (v) this.form.patchValue({ nome: v });
  }

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ email: string; nome: string; anexar: boolean }>();

  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nome: ['', [Validators.required]],
    anexar: [true],
  });

  onClose() {
    if (this.loading) return;
    this.close.emit();
  }

  onConfirm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, nome, anexar } = this.form.getRawValue();
    this.loading = true;
    this.confirm.emit({ email: email!, nome: nome!, anexar: !!anexar });
  }

  /** permite o pai desligar o loading após a resposta */
  public setLoading(v: boolean) { this.loading = v; }
}
