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

  dohvatiZaStampariju(korIme: string) {
    return this.http.get<Proizvod[]>(`${this.uri}/stampar/${korIme}`);
  }

  dodaj(podaci: FormData) {
    return this.http.post<Proizvod>(`${this.uri}/dodaj`, podaci);
  }

  azurirajKolicinu(id: string, kolicinaNaStanju: number, kor_ime: string) {
    return this.http.put<Proizvod>(`${this.uri}/kolicina/${id}`, {
      kolicinaNaStanju,
      kor_ime,
    });
  }

  uvezIzJsona(kreator: string, proizvodi: unknown[]) {
    return this.http.post<Proizvod[]>(`${this.uri}/uvoz-json`, { kreator, proizvodi });
  }

  dodajSlike(id: string, podaci: FormData) {
    return this.http.post<Proizvod>(`${this.uri}/${id}/slike`, podaci);
  }
}
