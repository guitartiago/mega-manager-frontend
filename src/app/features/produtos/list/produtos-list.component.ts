import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutosService } from '../produtos.service';
import { ProdutoResponseDTO } from '../produto.model';

@Component({
  standalone: true,
  selector: 'app-produtos-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './produtos-list.html',
})
export class ProdutosListComponent implements OnInit {
  private svc = inject(ProdutosService);

  items = signal<ProdutoResponseDTO[]>([]);
  loading = signal(false);
  q = signal('');

  filtered = computed(() => {
    const term = this.q().toLowerCase().trim();
    if (!term) return this.items();
    return this.items().filter(p => p.nome.toLowerCase().includes(term));
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list().subscribe({
      next: res => this.items.set(res),
      error: e => console.error(e),
      complete: () => this.loading.set(false),
    });
  }

  formatBRL(n: number) {
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n ?? 0);
    } catch { return n; }
  }

  remove(id: number) {
    if (!confirm('Excluir este produto?')) return;
    this.svc.remove(id).subscribe({
      next: () => this.load(),
      error: e => console.error(e),
    });
  }
}
