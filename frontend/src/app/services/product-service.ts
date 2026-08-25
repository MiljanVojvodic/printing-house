import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Proizvod } from '../models/proizvod';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  uri = 'http://localhost:4000/products';

  private http = inject(HttpClient)

  dohvatiSveProizvodeUProdavnici() {
    return this.http.get<Proizvod[]>(`${this.uri}/getAllProductsSorted`);
  }

  dohvatiSveProizvodeNaCekanju() {
    return this.http.get<Proizvod[]>(`${this.uri}/getAllProductsWaiting`);
  }

  lajkuj(id: number) {
    const data = {
      idP: id,
    };
    return this.http.post(`${this.uri}/like`, data);
  }

  dodajProizvod(naziv: string, opis: string, kreator: string) {
    const data = {
      naziv: naziv,
      opis: opis,
      kreator: kreator,
      lajkovi: 0,
      status: 'na cekanju',
      cena: 0,
    };
    return this.http.post(`${this.uri}/add`, data);
  }

  promeniStatusProizvoda(id: number, cena: number, status: string) {
    const data = {
      idP: id,
      cena: cena,
      status: status,
    };
    return this.http.post(`${this.uri}/change`, data);
  }
}
