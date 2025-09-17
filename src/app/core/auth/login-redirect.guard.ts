import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorage } from './token-storage';

export const loginRedirectGuard: CanActivateFn = () => {
  const token = inject(TokenStorage);
  if (token.isLoggedIn()) {
    inject(Router).navigate(['/']); // já logado? manda pra Home
    return false;
  }
  return true; // não logado -> pode ver /login
};
