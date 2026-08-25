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

export type StatusFakture = 'naruceno' | 'u_stampi' | 'isporuceno';

export class Invoice {
  _id = '';
  // Mongoose populate menja kupac/stampar iz stringa (ObjectId) u objekat sa
  // ovim poljima kada backend uradi .populate(...) (kupac: kod narudzbina
  // stampara; stampar: kod narudzbina klijenta).
  kupac: { _id: string; ime: string; prezime: string } | string = '';
  stampar: { _id: string; nazivInstitucije: string; grad: string } | string = '';
  stavke: StavkaFakture[] = [];
  ukupanIznos = 0;
  status: StatusFakture = 'naruceno';
  datumNarudzbine = '';
}
