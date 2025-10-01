import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'info' | 'warning' | 'error';
export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
  timeout?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private _list = signal<Toast[]>([]);
  list = this._list.asReadonly();
  private seq = 0;

  show(kind: ToastKind, title: string, message?: string, timeout = 4000) {
    const t: Toast = { id: ++this.seq, kind, title, message, timeout };
    this._list.update(arr => [t, ...arr]);
    if (timeout) setTimeout(() => this.dismiss(t.id), timeout);
  }

  success(t: string, m?: string, timeout?: number) { this.show('success', t, m, timeout); }
  info(t: string, m?: string, timeout?: number)    { this.show('info', t, m, timeout); }
  warn(t: string, m?: string, timeout?: number)    { this.show('warning', t, m, timeout); }
  error(t: string, m?: string, timeout?: number)   { this.show('error', t, m, timeout); }

  dismiss(id: number) {
    this._list.update(arr => arr.filter(x => x.id !== id));
  }

  clear() { this._list.set([]); }
}
