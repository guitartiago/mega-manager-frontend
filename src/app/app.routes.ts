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
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
