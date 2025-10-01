import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from './alert.service';

@Component({
  standalone: true,
  selector: 'app-toast-host',
  imports: [CommonModule],
  template: `
  <div class="fixed z-50 top-4 right-4 flex flex-col gap-2 w-[min(90vw,360px)]">
    <div *ngFor="let t of svc.list()"
         class="rounded-xl border p-3 shadow-sm bg-white flex gap-3 items-start"
         [ngClass]="map[t.kind]">
      <div class="mt-0.5 shrink-0" [ngClass]="iconColor[t.kind]">●</div>
      <div class="min-w-0 grow">
        <div class="font-semibold">{{ t.title }}</div>
        <div class="text-sm text-gray-600" *ngIf="t.message">{{ t.message }}</div>
      </div>
      <button class="rounded px-2 py-1 text-sm hover:bg-black/5"
              (click)="svc.dismiss(t.id)">✕</button>
    </div>
  </div>
  `,
})
export class ToastHostComponent {
  svc = inject(AlertService);

  map = {
    success: 'border-green-200',
    info:    'border-blue-200',
    warning: 'border-amber-200',
    error:   'border-red-200',
  } as const;

  iconColor = {
    success: 'text-green-600',
    info:    'text-blue-600',
    warning: 'text-amber-600',
    error:   'text-red-600',
  } as const;
}
