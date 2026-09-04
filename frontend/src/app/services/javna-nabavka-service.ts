import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JavnaNabavka } from '../models/javna-nabavka';
import { StavkaKorpe } from '../models/stavka-korpe';

@Injectable({
  providedIn: 'root',
})
export class JavnaNabavkaService {
  uri = 'http://localhost:4000/javne-nabavke';

  private http = inject(HttpClient);

  pokreni(klijentId: string, stavke: StavkaKorpe[]) {
    const data = {
      klijentId,
      stavke: stavke.map((s) => ({
        proizvodId: s.proizvodId,
        kolicina: s.kolicina,
        boja: s.boja,
        tipStampe: s.tipStampe,
        tekstPersonalizacije: s.tekstPersonalizacije,
      })),
    };
    return this.http.post<{ message: string; nabavkaId: string }>(
      `${this.uri}/pokreni`,
      data
    );
  }

  mojeNabavke(klijentId: string) {
    return this.http.get<JavnaNabavka[]>(`${this.uri}/klijent/${klijentId}`);
  }

  zaStampara(stamparId: string) {
    return this.http.get<JavnaNabavka[]>(`${this.uri}/stampar/${stamparId}`);
  }

  posaljiPonudu(
    nabavkaId: string,
    stamparId: string,
    stavke: { proizvodId: string; cenaPoJedinici: number; dostupnaKolicina: number }[]
  ) {
    return this.http.post(`${this.uri}/${nabavkaId}/ponuda`, { stamparId, stavke });
  }

  // Direktan link (ne HttpClient poziv) - klik otvara/preuzima PDF, isto
  // kao svaki obican link ka fajlu na serveru.
  izvestajUrl(nabavkaId: string): string {
    return `${this.uri}/${nabavkaId}/izvestaj.pdf`;
  }
}
