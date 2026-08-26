import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Recenzija, TipReakcije } from '../models/recenzija';

@Injectable({
  providedIn: 'root',
})
export class RecenzijaService {
  uri = 'http://localhost:4000/recenzije';

  private http = inject(HttpClient);

  posalji(
    proizvodId: string,
    klijentId: string,
    korIme: string,
    tipReakcije: TipReakcije,
    tekst: string
  ) {
    return this.http.post<Recenzija>(this.uri + '/', {
      proizvodId,
      klijentId,
      korIme,
      tipReakcije,
      tekst,
    });
  }

  poslednjiKomentari(proizvodId: string) {
    return this.http.get<Recenzija[]>(`${this.uri}/proizvod/${proizvodId}`);
  }

  mojaRecenzija(proizvodId: string, klijentId: string) {
    return this.http.get<Recenzija | null>(
      `${this.uri}/moja/${proizvodId}/${klijentId}`
    );
  }
}
