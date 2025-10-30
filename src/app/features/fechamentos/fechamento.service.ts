import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FechamentoResponseDTO, FechamentoResumoDTO, ItemFechamentoDTO } from './fechamento.model';

@Injectable({ providedIn: 'root' })
export class FechamentoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/fechamentos`;
  private baseUrlPix = `${environment.apiUrl}/api/pix`;
  private baseUrlNotif = `${environment.apiUrl}/api/notificacao`;

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

  /** Calcula total agrupado (por nomeProduto) a partir do detalhe */
  computeTotalAgrupadoFrom(f: FechamentoResponseDTO): number {
    const mapAgg = new Map<string, { qtd: number; total: number }>();
    for (const it of f.itens ?? []) {
      const key = String(it.produtoId);
      const agg = mapAgg.get(key) ?? { qtd: 0, total: 0 };
      agg.qtd   += it.quantidade;
      agg.total += it.valorTotal;
      mapAgg.set(key, agg);
    }
    let total = 0;
    for (const v of mapAgg.values()) total += v.total;
    return total;
  }

  /** QR Code (PNG) como ObjectURL para usar no <img> */
  getPixQrCode(valor: number, descricao: string): Observable<string> {
    return this.http.get(`${this.baseUrlPix}/qrcode`, {
      params: { valor: valor.toFixed(2), descricao },
      responseType: 'blob'
    }).pipe(map(blob => URL.createObjectURL(blob)));
  }

  /** Pix copia-e-cola (payload EMV) como texto */
  getPixPayload(valor: number, descricao: string): Observable<string> {
    return this.http.get(`${this.baseUrlPix}/payload`, {
      params: { valor: valor.toFixed(2), descricao },
      responseType: 'text'
    });
  }

  /** Dispara e-mail via backend (controller Notificacao) */
  enviarContaPorEmail(emailDestino: string, nomeCliente: string, valor: number, descricao: string, anexar = true): Observable<void> {
    const body = new HttpParams()
      .set('emailDestino', emailDestino)
      .set('nomeCliente', nomeCliente)
      .set('valor', valor.toFixed(2))
      .set('descricao', descricao)
      .set('anexar', anexar ? 'true' : 'false');

    return this.http.post<void>(`${this.baseUrlNotif}/enviar-conta`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }
}
