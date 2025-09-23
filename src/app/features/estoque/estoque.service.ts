import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EntradaEstoqueRequestDTO, EntradaEstoqueResponseDTO } from './estoque.model';
import { forkJoin, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EstoqueService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  criarEntrada(payload: EntradaEstoqueRequestDTO) {
    return this.http.post<EntradaEstoqueResponseDTO>(`${this.base}/estoque`, payload);
  }

  criarEntradasLote(items: EntradaEstoqueRequestDTO[]): Observable<EntradaEstoqueResponseDTO[]> {
    // enquanto não existe endpoint em lote, disparamos várias requisições
    return forkJoin(items.map(i => this.criarEntrada(i)));
  }

  listarEntradasPorProduto(produtoId: number) {
    return this.http.get<EntradaEstoqueResponseDTO[]>(`${this.base}/estoque/produto/${produtoId}`);
  }
}
