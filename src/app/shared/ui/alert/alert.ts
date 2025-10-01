import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type AlertKind = 'success' | 'info' | 'warning' | 'error';

@Component({
  standalone: true,
  selector: 'app-alert',
  imports: [CommonModule],
  template: `
  <div
    *ngIf="open()"
    class="rounded-xl border p-3 md:p-4 flex gap-3 items-start"
    [ngClass]="kindClasses[kind]"
    role="alert"
    aria-live="polite"
  >
    <div [ngClass]="iconWrap[kind]" class="mt-0.5 shrink-0 rounded-full p-1.5">
      <svg *ngIf="kind==='success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 1.414-1.414l2.293 2.293 6.543-6.543a1 1 0 0 1 1.414 0Z"/>
      </svg>
      <svg *ngIf="kind==='info'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm.75-11.5h-1.5v1.5h1.5V6.5Zm0 3h-1.5V14h1.5V9.5Z"/>
      </svg>
      <svg *ngIf="kind==='warning'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3.172 1.757 20h20.486L12 3.172ZM11 9h2v5h-2V9Zm0 6h2v2h-2v-2Z"/>
      </svg>
      <svg *ngIf="kind==='error'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.593c.75 1.335-.214 3.008-1.742 3.008H3.48c-1.528 0-2.492-1.673-1.742-3.008L8.257 3.1Zm.743 3.401v4h2v-4h-2Zm0 6v2h2v-2h-2Z"/>
      </svg>
    </div>

    <div class="min-w-0 grow">
      <div class="font-semibold">{{ title }}</div>
      <div class="text-sm mt-1 text-gray-700" *ngIf="message">{{ message }}</div>
      <ng-content></ng-content>
    </div>

    <button
      type="button"
      class="ml-2 rounded-md px-2 py-1 text-sm hover:bg-black/5"
      aria-label="Fechar"
      (click)="open.set(false)"
    >
      ✕
    </button>
  </div>
  `,
})
export class AlertComponent {
  @Input() kind: AlertKind = 'info';
  @Input() title = '';
  @Input() message?: string;
  open = signal(true);

  readonly kindClasses: Record<AlertKind, string> = {
    success: 'border-green-200 bg-green-50',
    info:    'border-blue-200 bg-blue-50',
    warning: 'border-amber-200 bg-amber-50',
    error:   'border-red-200 bg-red-50',
  };

  readonly iconWrap: Record<AlertKind, string> = {
    success: 'bg-green-200 text-green-700',
    info:    'bg-blue-200 text-blue-700',
    warning: 'bg-amber-200 text-amber-700',
    error:   'bg-red-200 text-red-700',
  };
}
