import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FechamentoResponseDTO, FechamentoResumoDTO } from './fechamento.model';

@Injectable({ providedIn: 'root' })
export class FechamentoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/fechamentos`;

  fechar(clienteId: number): Observable<FechamentoResponseDTO> {
    return this.http.post<FechamentoResponseDTO>(`${this.base}/fechar/${clienteId}`, {});
  }

  list(opts?: { clienteId?: number; de?: string; ate?: string }): Observable<FechamentoResumoDTO[]> {
    let params = new HttpParams();
    if (opts?.clienteId) params = params.set('clienteId', opts.clienteId);
    if (opts?.de)        params = params.set('de', opts.de);
    if (opts?.ate)       params = params.set('ate', opts.ate);
    return this.http.get<FechamentoResumoDTO[]>(this.base, { params });
  }

  get(id: number): Observable<FechamentoResponseDTO> {
    return this.http.get<FechamentoResponseDTO>(`${this.base}/${id}`);
  }
}
