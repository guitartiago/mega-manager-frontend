import { Injectable } from '@angular/core';
const KEY = 'mm_token';

function decodePayload(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  set(token: string) { localStorage.setItem(KEY, token); }
  get() { return localStorage.getItem(KEY); }
  clear() { localStorage.removeItem(KEY); }

  isExpired(): boolean {
    const t = this.get();
    if (!t) return true;
    const payload = decodePayload(t);
    if (!payload?.exp) return false; // sem exp -> assume não expirado
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSec;
  }

  isLoggedIn() {
    if (this.isExpired()) { this.clear(); return false; }
    return !!this.get();
  }

  /** Lê roles de `roles` ou `authorities` e normaliza removendo `ROLE_` */
  getRoles(): string[] {
    const t = this.get();
    if (!t) return [];
    const p = decodePayload(t) || {};
    const raw: string[] = p.roles || p.authorities || [];
    return raw.map(r => r.replace(/^ROLE_/, '')).map(r => r.toUpperCase());
  }

  /** Checagens úteis */
  hasRole(role: string): boolean {
    const r = role.toUpperCase().replace(/^ROLE_/, '');
    return this.getRoles().includes(r);
  }
  hasAnyRole(roles: string[]): boolean {
    const want = roles.map(r => r.toUpperCase().replace(/^ROLE_/, ''));
    const have = this.getRoles();
    return want.some(r => have.includes(r));
  }

  logout() { this.clear(); }
}
