import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Invoice } from '../models/invoice';
import { StavkaKorpe } from '../models/stavka-korpe';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  uri = 'http://localhost:4000/invoices';

  private http = inject(HttpClient);

  mojeNarudzbine(kupacId: string) {
    return this.http.get<Invoice[]>(`${this.uri}/klijent/${kupacId}`);
  }

  potvrdiNarudzbinu(kupacId: string, stavke: StavkaKorpe[]) {
    const data = {
      kupacId,
      stavke: stavke.map((s) => ({
        proizvodId: s.proizvodId,
        kolicina: s.kolicina,
        boja: s.boja,
        tipStampe: s.tipStampe,
        tekstPersonalizacije: s.tekstPersonalizacije,
      })),
    };
    return this.http.post<{ message: string; brojFaktura: number }>(
      `${this.uri}/potvrdi`,
      data
    );
  }

  narudzbineStampara(stamparId: string) {
    return this.http.get<Invoice[]>(`${this.uri}/stampar/${stamparId}`);
  }

  sledeciStatus(fakturaId: string) {
    return this.http.post<Invoice>(`${this.uri}/sledeci-status/${fakturaId}`, {});
  }
}
