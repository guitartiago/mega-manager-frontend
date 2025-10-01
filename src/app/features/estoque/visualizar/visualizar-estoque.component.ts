import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ProdutosService } from '../../produtos/produtos.service';
import { ProdutoResponseDTO } from '../../produtos/produto.model';
import { EstoqueService } from '../estoque.service';
import { EntradaEstoqueResponseDTO } from '../estoque.model';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-visualizar-estoque',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './visualizar.html',
})
export class VisualizarEstoqueComponent implements OnInit {
  private fb = inject(FormBuilder);
  private produtosSvc = inject(ProdutosService);
  private estoqueSvc = inject(EstoqueService);

  produtos = signal<ProdutoResponseDTO[]>([]);
  entradas = signal<EntradaEstoqueResponseDTO[]>([]);
  carregando = signal(false);

  form = this.fb.group({ produtoId: [null] });

  // ✅ sinal com o id do produto selecionado
  private produtoId = signal<number | null>(null);

  // ✅ computed agora depende de signals (produtoId e produtos)
  produtoSelecionado = computed(() => {
    const id = this.produtoId();
    if (id == null) return null;
    return this.produtos().find(p => p.id === id) ?? null;
  });

  produtoSelecionadoId(): number | null {
    // se usa Reactive Forms:
    const id = this.form?.get('produtoId')?.value;
    return id ?? null;

    // se usa signal/variável, retorne a fonte correspondente.
  }

  // KPIs
  totalQuantidade = computed(() =>
    this.entradas().reduce((acc, e) => acc + (e.saldo ?? e.quantidade ?? 0), 0)
  );
  custoMedio = computed(() => {
    const ens = this.entradas();
    if (!ens.length) return 0;
    const totalValor = ens.reduce((acc, e) => acc + e.precoCustoUnitario * (e.quantidade ?? 0), 0);
    const totalQtd = ens.reduce((acc, e) => acc + (e.quantidade ?? 0), 0);
    return totalQtd ? totalValor / totalQtd : 0;
  });

  ngOnInit() {
    this.produtosSvc.list().subscribe({
      next: p => this.produtos.set(p.filter(x => x.ativo)),
      error: e => console.error(e),
    });

    this.form.get('produtoId')!.valueChanges.subscribe(id => {
      const val = id != null ? Number(id) : null;
      this.produtoId.set(val);          // <-- atualiza o signal
      this.entradas.set([]);

      if (val == null) return;

      this.carregando.set(true);
      this.estoqueSvc.listarEntradasPorProduto(val).subscribe({
        next: res => this.entradas.set(res),
        error: e => { console.error(e); this.carregando.set(false); },
        complete: () => this.carregando.set(false),
      });
    });
  }

  formatBRL(n: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n ?? 0);
  }
  formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' +
           d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
