import { Injectable } from '@angular/core';
import { StavkaKorpe } from '../models/stavka-korpe';

const KLJUC = 'korpa';

export class GrupaStamparije {
  stamparijaKorIme = '';
  nazivStamparije = '';
  gradStamparije = '';
  stavke: StavkaKorpe[] = [];
  ukupnoZaStampariju = 0;
}

// Korpa se cuva u localStorage (isti obrazac kao 'ulogovan') - jednostavno
// resenje, dovoljno za obim projekta; nestaje ako klijent promeni uredjaj
// pre potvrde narudzbine.
@Injectable({
  providedIn: 'root',
})
export class CartService {
  sveStavke(): StavkaKorpe[] {
    const sacuvano = localStorage.getItem(KLJUC);
    if (!sacuvano) return [];
    try {
      return JSON.parse(sacuvano) as StavkaKorpe[];
    } catch {
      return [];
    }
  }

  brojStavki(): number {
    return this.sveStavke().length;
  }

  dodaj(stavka: StavkaKorpe) {
    const stavke = this.sveStavke();
    stavke.push(stavka);
    localStorage.setItem(KLJUC, JSON.stringify(stavke));
  }

  ukloni(indeks: number) {
    const stavke = this.sveStavke();
    stavke.splice(indeks, 1);
    localStorage.setItem(KLJUC, JSON.stringify(stavke));
  }

  isprazni() {
    localStorage.removeItem(KLJUC);
  }

  grupisanoPoStampariji(): GrupaStamparije[] {
    const stavke = this.sveStavke();
    const mapa = new Map<string, GrupaStamparije>();

    for (const s of stavke) {
      let grupa = mapa.get(s.stamparijaKorIme);
      if (!grupa) {
        grupa = new GrupaStamparije();
        grupa.stamparijaKorIme = s.stamparijaKorIme;
        grupa.nazivStamparije = s.nazivStamparije;
        grupa.gradStamparije = s.gradStamparije;
        mapa.set(s.stamparijaKorIme, grupa);
      }
      grupa.stavke.push(s);
      grupa.ukupnoZaStampariju += s.ukupnaCenaStavke;
    }

    return [...mapa.values()];
  }

  ukupanIznos(): number {
    return this.sveStavke().reduce((zbir, s) => zbir + s.ukupnaCenaStavke, 0);
  }
}
