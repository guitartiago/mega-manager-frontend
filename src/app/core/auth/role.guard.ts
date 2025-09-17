import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorage } from './token-storage';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const token = inject(TokenStorage);
  const router = inject(Router);

  // Se não logado/expirado -> manda pro login
  if (!token.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const required: string[] = (route.data?.['roles'] as string[]) || [];
  if (required.length === 0) return true; // rota não exige roles específicas

  if (token.hasAnyRole(required)) return true;

  // Sem permissão -> poderia mandar para /403. Aqui voltamos à home:
  router.navigate(['/']);
  return false;
};
