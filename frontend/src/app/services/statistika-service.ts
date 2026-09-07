import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface PrometStamparije {
  naziv: string;
  ukupanPromet: number;
}

export interface NajcesciProizvod {
  naziv: string;
  kolicina: number;
}

export interface TackaOcene {
  datum: string;
  ocena: number;
}

export interface OcenaProizvoda {
  proizvodId: string;
  naziv: string;
  tacke: TackaOcene[];
}

@Injectable({
  providedIn: 'root',
})
export class StatistikaService {
  uri = 'http://localhost:4000/statistika';

  private http = inject(HttpClient);

  prometPoStampariji() {
    return this.http.get<PrometStamparije[]>(`${this.uri}/promet-po-stampariji`);
  }

  najcesciProizvodi() {
    return this.http.get<NajcesciProizvod[]>(`${this.uri}/najcesci-proizvodi`);
  }

  ocenaKrozVreme() {
    return this.http.get<OcenaProizvoda[]>(`${this.uri}/ocena-kroz-vreme`);
  }
}
