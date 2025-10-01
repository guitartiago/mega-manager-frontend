import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ConsumoRequestDTO, ConsumoResponseDTO, DetalheContaDTO } from './consumo.model';
import { map, forkJoin, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConsumoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  /** Registrar consumo */
  registrar(payload: ConsumoRequestDTO) {
    return this.http.post<ConsumoResponseDTO>(`${this.base}/consumos`, payload);
  }

  /** Registrar vários consumos em paralelo (uma chamada POST /consumos por item) */
  registrarVarios(items: ConsumoRequestDTO[]): Observable<ConsumoResponseDTO[]> {
  return forkJoin(items.map(i => this.registrar(i)));
  }

  /** Nova base: detalhes completos + total */
  detalharConta(clienteId: number) {
    return this.http.get<DetalheContaDTO>(`${this.base}/consumos/detalhar-conta/${clienteId}`);
  }

  /** Total em aberto via detalhar-conta */
  totalEmAberto(clienteId: number) {
    return this.detalharConta(clienteId).pipe(map(x => x.total ?? 0));
  }

  /** Fechar a conta (pagar todos) */
  fecharConta(clienteId: number) {
    return this.http.post<void>(`${this.base}/consumos/pagar-conta/${clienteId}`, {});
  }
}
