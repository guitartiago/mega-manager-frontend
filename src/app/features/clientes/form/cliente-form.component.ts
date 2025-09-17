import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../clientes';
import { ClienteRequestDTO, ClienteResponseDTO, Perfil } from '../clientes.model';

@Component({
  standalone: true,
  selector: 'app-cliente-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="max-w-xl grid gap-4">
    <h2 class="text-2xl font-bold">{{ isEdit() ? 'Editar cliente' : 'Novo cliente' }}</h2>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid gap-3 bg-white p-4 rounded-xl border shadow-sm">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Nome *</label>
        <input formControlName="nome" class="w-full p-2 border rounded" required>
        <p class="text-xs text-red-600" *ngIf="form.controls.nome.touched && form.controls.nome.invalid">
          Informe o nome.
        </p>
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1">Email *</label>
        <input formControlName="email" type="email" class="w-full p-2 border rounded" required>
        <p class="text-xs text-red-600" *ngIf="form.controls.email.touched && form.controls.email.invalid">
          Email inválido.
        </p>
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1">Perfil *</label>
        <select formControlName="perfil" class="w-full p-2 border rounded" required>
          <option *ngFor="let p of perfis" [value]="p">{{ p }}</option>
        </select>
      </div>

      <div class="flex justify-end gap-2">
        <button type="button" (click)="router.navigate(['/clientes'])"
                class="px-3 py-2 rounded border hover:bg-gray-50">Cancelar</button>
        <button type="submit" [disabled]="form.invalid || saving()"
                class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          {{ saving() ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </section>
  `
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private svc = inject(ClientesService);

  perfis: Perfil[] = ['COMUM','SOCIO','PARCEIRO'];
  isEdit = signal(false);
  saving = signal(false);
  id: number | null = null;

  form = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    perfil: ['COMUM' as Perfil, Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.id = Number(idParam);
      this.svc.get(this.id).subscribe({
        next: (c: ClienteResponseDTO) => this.form.patchValue({
          nome: c.nome, email: c.email, perfil: c.perfil
        }),
        error: (e) => console.error(e),
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);

    const payload = this.form.getRawValue() as ClienteRequestDTO;

    const req$ = this.isEdit() && this.id
      ? this.svc.update(this.id, payload)
      : this.svc.create(payload);

    req$.subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: (e) => { console.error(e); this.saving.set(false); },
    });
  }
}
