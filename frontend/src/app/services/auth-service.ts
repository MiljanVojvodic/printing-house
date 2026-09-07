import { Injectable } from '@angular/core';
import { Korisnik, TipKorisnika } from '../models/korisnik';

const KLJUC = 'ulogovan';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  postaviUlogovanog(korisnik: Korisnik) {
    localStorage.setItem(KLJUC, JSON.stringify(korisnik));
  }

  trenutniKorisnik(): Korisnik | null {
    const sacuvano = localStorage.getItem(KLJUC);
    if (!sacuvano) return null;
    try {
      return JSON.parse(sacuvano) as Korisnik;
    } catch {
      return null;
    }
  }

  jeUlogovan(): boolean {
    return this.trenutniKorisnik() !== null;
  }

  imaUlogu(...tipovi: TipKorisnika[]): boolean {
    const korisnik = this.trenutniKorisnik();
    return !!korisnik && tipovi.includes(korisnik.tip);
  }

  odjaviSe() {
    localStorage.removeItem(KLJUC);
  }

  pocetnaRutaZaTip(tip: TipKorisnika): string {
    switch (tip) {
      case 'fizicko':
      case 'pravno':
        return '/klijent/profil';
      case 'stampar':
        return '/stampar/profil';
      case 'admin':
        return '/admin/zahtevi';
      default:
        return '/';
    }
  }
}
