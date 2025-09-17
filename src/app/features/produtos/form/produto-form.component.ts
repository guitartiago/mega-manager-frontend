import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutosService } from '../produtos.service';
import { ProdutoRequestDTO, ProdutoResponseDTO } from '../produto.model';

@Component({
  standalone: true,
  selector: 'app-produto-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './produto-form.html',
})
export class ProdutoFormComponent implements OnInit {
  @ViewChild('precoInput') precoInput!: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private svc = inject(ProdutosService);

  isEdit = signal(false);
  id: number | null = null;
  saving = signal(false);

  form = this.fb.group({
    nome: ['', Validators.required],
    precoVenda: ['', Validators.required], // mantemos formatado no form
    ativo: [true, Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.id = Number(idParam);
      this.svc.get(this.id).subscribe({
        next: (p: ProdutoResponseDTO) => {
          this.form.patchValue({
            nome: p.nome,
            precoVenda: this.formatBR(p.precoVenda), // mostra formatado
            ativo: p.ativo,
          });
        },
        error: e => console.error(e),
      });
    }
  }

  // Máscara de moeda (pt-BR) enquanto digita
  onPrecoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // mantém apenas dígitos
    const digits = input.value.replace(/\D/g, '').slice(0, 13); // até trilhões c/ centavos
    const valor = this.centsToBR(digits);
    input.value = valor;
    this.form.controls.precoVenda.setValue(valor, { emitEvent: false });
  }

  // Converte dígitos (centavos) -> "1.234,56"
  private centsToBR(digits: string): string {
    if (!digits) return '';
    const n = parseInt(digits, 10);
    const reais = (n / 100).toFixed(2); // "1234.56"
    // formata para pt-BR
    const [i, d] = reais.split('.');
    const iFmt = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${iFmt},${d}`;
  }

  // number -> "1.234,56"
  private formatBR(n: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
      .format(n ?? 0).replace('R$ ', '');
  }

  // "1.234,56" | "1234,56" | "1234" -> 1234.56
  private brToNumber(txt: string): number {
    if (!txt) return 0;
    const clean = txt
        .replace(/R\$\s?/, '')
        .replace(/\./g, '')
        .replace(',', '.');
    const n = Number(clean);
    return isNaN(n) ? 0 : n;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);

    // prepara payload convertendo o preço para number
    const raw = this.form.getRawValue();
    const payload: ProdutoRequestDTO = {
      nome: raw.nome!,
      precoVenda: this.brToNumber(raw.precoVenda || ''),
      ativo: !!raw.ativo,
    };

    const req$ = this.isEdit() && this.id
      ? this.svc.update(this.id!, payload)
      : this.svc.create(payload);

    req$.subscribe({
      next: () => this.router.navigate(['/produtos']),
      error: e => { console.error(e); this.saving.set(false); },
    });
  }
}
