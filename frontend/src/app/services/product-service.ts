import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Proizvod } from '../models/proizvod';

// NAPOMENA: privremeno svedeno na minimum posle promene Product seme (Faza 0).
// Prava pretraga/katalog dolaze u Fazi 2, upravljanje proizvodima kod stampara u Fazi 5.
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  uri = 'http://localhost:4000/products';

  private http = inject(HttpClient);

  dohvatiSveProizvode() {
    return this.http.get<Proizvod[]>(`${this.uri}/getAll`);
  }
}
