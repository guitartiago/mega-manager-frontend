import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../clientes';
import { ClienteRequestDTO, ClienteResponseDTO, Perfil } from '../clientes.model';

@Component({
  standalone: true,
  selector: 'app-cliente-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-form.component.html'
})
export class ClienteFormComponent implements OnInit {
  @ViewChild('celInput') celInput!: ElementRef<HTMLInputElement>;
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private svc = inject(ClientesService);

  // 8–11 dígitos OU (11) 91234-5678 / 99123-4567 etc.
  CELULAR_PATTERN = /^(?:\d{8,11}|(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4})$/;

  perfis: Perfil[] = ['COMUM','SOCIO','PARCEIRO'];
  isEdit = signal(false);
  saving = signal(false);
  id: number | null = null;

  form = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    celular: ['', [Validators.required, Validators.pattern(this.CELULAR_PATTERN)]],
    perfil: ['COMUM' as Perfil, Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.id = Number(idParam);
      this.svc.get(this.id).subscribe({
        next: (c: ClienteResponseDTO) => {
          this.form.patchValue({
          nome: c.nome, 
          email: c.email, 
          celular: this.maskDisplay(c.celular), 
          perfil: c.perfil
          });
          queueMicrotask(() => {
            const el = this.celInput?.nativeElement;
            if (el) el.value = this.maskDisplay(this.form.controls.celular.value || '');
          });
        },
        error: (e) => console.error(e),
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);

    const payload = this.form.getRawValue() as ClienteRequestDTO;
    payload.celular = (payload.celular || '').replace(/\D/g, '');

    const req$ = this.isEdit() && this.id
      ? this.svc.update(this.id, payload)
      : this.svc.create(payload);

    req$.subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: (e) => { console.error(e); this.saving.set(false); },
    });
  }

  onCelularInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 11);

    // máscara de exibição
    let masked = digits;
    if (digits.length <= 8)       
      masked = digits.replace(/(\d{4})(\d{0,4})/, '$1-$2').trim();
    else if (digits.length === 9) 
      masked = digits.replace(/(\d{5})(\d{0,4})/, '$1-$2').trim();
    else if (digits.length === 10)
      masked = digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    else                          
      masked = digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();

    // o FormControl deve ficar com o MESMO valor exibido
    this.form.controls.celular.setValue(masked, { emitEvent: false });
    input.value = masked; // mantém a aparência
  }

  // Máscara de exibição (com/sem DDD)
  private maskDisplay(raw: string): string {
    if (!raw) return '';
    if (raw.length <= 8) {
      // 99123456 -> 9912-3456
      return raw.replace(/(\d{4})(\d{0,4})/, '$1-$2').trim();
    }
    if (raw.length === 9) {
      // 991234567 -> 99123-4567
      return raw.replace(/(\d{5})(\d{0,4})/, '$1-$2').trim();
    }
    if (raw.length === 10) {
      // 1199123456 -> (11) 9912-3456
      return raw.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    // 11 dígitos: 11991234567 -> (11) 99123-4567
    return raw.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  }

}
