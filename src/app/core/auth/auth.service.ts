import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type LoginRequest = { username: string; password: string };
type LoginResponse = { token: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload);
  }
}
