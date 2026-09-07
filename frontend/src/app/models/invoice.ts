export class StavkaFakture {
  proizvod = '';
  naziv = '';
  kolicina = 0;
  cenaPoJedinici = 0;
  boja = '';
  tipStampe = '';
  tekstPersonalizacije = '';
  ukupnaCenaStavke = 0;
}

export type StatusFakture = 'naruceno' | 'u_stampi' | 'isporuceno' | 'primljeno' | 'otkazano';

export class Invoice {
  _id = '';
  kupac: { _id: string; ime: string; prezime: string } | string = '';
  stampar: { _id: string; nazivInstitucije: string; grad: string } | string = '';
  stavke: StavkaFakture[] = [];
  ukupanIznos = 0;
  status: StatusFakture = 'naruceno';
  datumNarudzbine = '';
}
