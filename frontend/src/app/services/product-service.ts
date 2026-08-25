import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Proizvod } from '../models/proizvod';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  uri = 'http://localhost:4000/products';

  private http = inject(HttpClient);

  top5() {
    return this.http.get<Proizvod[]>(`${this.uri}/top5`);
  }

  pretraga(naziv: string, kategorija: string) {
    let params = new HttpParams();
    if (naziv) params = params.set('naziv', naziv);
    if (kategorija) params = params.set('kategorija', kategorija);
    return this.http.get<Proizvod[]>(`${this.uri}/pretraga`, { params });
  }

  dohvatiPoId(id: string) {
    return this.http.get<Proizvod>(`${this.uri}/${id}`);
  }
}
