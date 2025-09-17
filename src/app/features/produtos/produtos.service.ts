import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProdutoRequestDTO, ProdutoResponseDTO } from './produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/produtos`;

  list() {
    return this.http.get<ProdutoResponseDTO[]>(this.base);
  }

  get(id: number) {
    return this.http.get<ProdutoResponseDTO>(`${this.base}/${id}`);
  }

  create(payload: ProdutoRequestDTO) {
    return this.http.post<ProdutoResponseDTO>(this.base, payload);
  }

  update(id: number, payload: ProdutoRequestDTO) {
    return this.http.put<ProdutoResponseDTO>(`${this.base}/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
