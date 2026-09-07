import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { TipKorisnika } from '../models/korisnik';

export function roleGuard(...dozvoljeniTipovi: TipKorisnika[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.imaUlogu(...dozvoljeniTipovi)) {
      return true;
    }

    const ciljaNaAdmina = dozvoljeniTipovi.includes('admin');
    return router.parseUrl(ciljaNaAdmina ? '/administracija/prijava' : '/prijava');
  };
}
