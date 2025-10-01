import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ProdutosService } from '../../produtos/produtos.service';
import { ProdutoResponseDTO } from '../../produtos/produto.model';
import { EstoqueService } from '../estoque.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-entrada-estoque',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './entrada.html',
})
export class EntradaEstoqueComponent implements OnInit {
  private fb = inject(FormBuilder);
  private produtosSvc = inject(ProdutosService);
  private estoqueSvc = inject(EstoqueService);
  private route = inject(ActivatedRoute);

  produtos = signal<ProdutoResponseDTO[]>([]);
  salvando = signal(false);
  sucesso = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.group({
    itens: this.fb.array([] as any[]),
  });

  get itens() { return this.form.get('itens') as FormArray; }

  ngOnInit() {
    this.produtosSvc.list().subscribe({
      next: p => this.produtos.set(p.filter(x => x.ativo)),
      error: e => console.error(e),
    });
    this.addItem(); // começa com 1 card
  }

  addItem() {
    this.itens.push(this.fb.group({
      produtoId: [null, Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      precoCustoUnitario: ['', [Validators.required]], // mantemos formatado no form
    }));
  }

  removeItem(ix: number) {
    this.itens.removeAt(ix);
  }

  // máscara simples pt-BR para custo (igual ao produto)
  onCustoInput(ctrl: any, event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 13);
    const masked = this.centsToBR(digits);
    input.value = masked;
    ctrl.patchValue(masked, { emitEvent: false });
  }
  private centsToBR(digits: string): string {
    if (!digits) return '';
    const n = parseInt(digits, 10);
    const reais = (n / 100).toFixed(2);
    const [i, d] = reais.split('.');
    const iFmt = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${iFmt},${d}`;
  }
  private brToNumber(txt: string): number {
    if (!txt) return 0;
    const clean = txt.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
    const n = Number(clean);
    return isNaN(n) ? 0 : n;
  }

  salvar() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    this.erro.set(null);
    this.sucesso.set(false);

    const payload = this.itens.getRawValue().map((i: any) => ({
      produtoId: Number(i.produtoId),
      quantidade: Number(i.quantidade),
      precoCustoUnitario: this.brToNumber(i.precoCustoUnitario),
    }));

    this.estoqueSvc.criarEntradasLote(payload).subscribe({
      next: () => { this.sucesso.set(true); this.form.reset(); this.itens.clear(); this.addItem(); },
      error: (e) => { console.error(e); this.erro.set('Falha ao salvar entradas.'); },
      complete: () => this.salvando.set(false),
    });
  }
}
