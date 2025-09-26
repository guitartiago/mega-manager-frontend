import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { loginRedirectGuard } from './core/auth/login-redirect.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: 'login',
    canActivate: [loginRedirectGuard],
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
      { path: 'clientes'
        , loadComponent: () => import('./features/clientes/list/list').then(m => m.ClientesListComponent)
        , canActivate: [roleGuard]
        , data: { roles: ['ADMIN', 'USER'] }
      },
      { path: 'clientes/new'
        , loadComponent: () => import('./features/clientes/form/cliente-form.component').then(m => m.ClienteFormComponent)
        , canActivate: [roleGuard]
        , data: { roles: ['ADMIN', 'USER'] }
      },
      { path: 'clientes/:id/edit'
        , loadComponent: () => import('./features/clientes/form/cliente-form.component').then(m => m.ClienteFormComponent) 
        , canActivate: [roleGuard]
        , data: { roles: ['ADMIN', 'USER'] }
      },
      { path: 'produtos'
        , loadComponent: () => import('./features/produtos/list/produtos-list.component').then(m => m.ProdutosListComponent)
        , canActivate: [roleGuard]
        , data: { roles: ['ADMIN', 'USER'] }
      },
      { path: 'produtos/new'
        , loadComponent: () => import('./features/produtos/form/produto-form.component').then(m => m.ProdutoFormComponent)
        , canActivate: [roleGuard]
        , data: { roles: ['ADMIN'] }
      },
      { path: 'produtos/:id/edit'
        , loadComponent: () => import('./features/produtos/form/produto-form.component').then(m => m.ProdutoFormComponent)
        , canActivate: [roleGuard]
        , data: { roles: ['ADMIN'] }
      },
      { path: 'estoque/entrada'
        , loadComponent: () => import('./features/estoque/entrada/entrada-estoque.component').then(m => m.EntradaEstoqueComponent)
        , canActivate: [roleGuard]
        , data: { roles: ['ADMIN', 'USER'] }
      },
      { path: 'estoque/visualizar'
        , loadComponent: () => import('./features/estoque/visualizar/visualizar-estoque.component').then(m => m.VisualizarEstoqueComponent)
        , canActivate: [roleGuard]
        , data: { roles: ['ADMIN', 'USER'] }
      },
      { path: 'consumos',            loadComponent: () => import('./features/consumos/consumos-home.component').then(m => m.ConsumosHomeComponent) },
      { path: 'consumos/novo',       loadComponent: () => import('./features/consumos/registrar-consumo.component').then(m => m.RegistrarConsumoComponent) },
      { path: 'consumos/:clienteId', loadComponent: () => import('./features/consumos/conta-detalhes.component').then(m => m.ContaDetalhesComponent) },   
    ]
  },
  { path: '**', redirectTo: '' }
];
