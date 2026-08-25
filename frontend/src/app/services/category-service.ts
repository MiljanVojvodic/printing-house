import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Kategorija } from '../models/kategorija';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  uri = 'http://localhost:4000/categories';

  private http = inject(HttpClient);

  sveKategorije() {
    return this.http.get<Kategorija[]>(`${this.uri}/all`);
  }

  aktivneKategorije() {
    return this.http.get<Kategorija[]>(`${this.uri}/aktivne`);
  }

  dodajKategoriju(naziv: string) {
    return this.http.post<Kategorija>(`${this.uri}/`, { naziv });
  }

  dodajPodkategoriju(kategorijaId: string, naziv: string) {
    return this.http.post<Kategorija>(
      `${this.uri}/${kategorijaId}/podkategorije`,
      { naziv }
    );
  }
}
