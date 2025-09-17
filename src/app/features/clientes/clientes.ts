import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ClienteRequestDTO, ClienteResponseDTO } from './clientes.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/clientes`;
  
  list() {
    return this.http.get<ClienteResponseDTO[]>(this.base);
  }

  get(id: number) {
    return this.http.get<ClienteResponseDTO>(`${this.base}/${id}`);
  }

  create(payload: ClienteRequestDTO) {
    return this.http.post<ClienteResponseDTO>(this.base, payload);
  }

  update(id: number, payload: ClienteRequestDTO) {
    return this.http.put<ClienteResponseDTO>(`${this.base}/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
