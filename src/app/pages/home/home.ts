import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-home',
  template: `
    <section class="grid gap-4">
      <h2 class="text-2xl font-bold">Dashboard</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="rounded-xl border bg-white p-4 shadow-sm">
          <div class="text-sm text-gray-500">Clientes</div>
          <div class="text-2xl font-semibold">0</div>
        </div>
        <div class="rounded-xl border bg-white p-4 shadow-sm">
          <div class="text-sm text-gray-500">Produtos</div>
          <div class="text-2xl font-semibold">0</div>
        </div>
        <div class="rounded-xl border bg-white p-4 shadow-sm">
          <div class="text-sm text-gray-500">Consumos</div>
          <div class="text-2xl font-semibold">0</div>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent {}
