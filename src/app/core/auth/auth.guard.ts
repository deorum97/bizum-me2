import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ready$.pipe(
    filter(Boolean),
    take(1),
    switchMap(() =>
      authService.user$.pipe(
        take(1),
        map((user) => (user ? true : router.createUrlTree(['/login']))),
      ),
    ),
  );
};
