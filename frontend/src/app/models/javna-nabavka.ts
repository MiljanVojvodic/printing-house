export class TrazenaStavka {
  proizvod = '';
  naziv = '';
  kolicina = 0;
  boja = '';
  tipStampe = '';
  tekstPersonalizacije = '';
}

export class StavkaPonude {
  proizvod = '';
  cenaPoJedinici = 0;
  dostupnaKolicina = 0;
}

export class Ponuda {
  _id = '';
  javnaNabavka = '';
  stampar: { _id: string; nazivInstitucije: string } | string = '';
  stavke: StavkaPonude[] = [];
  ukupnaCena = 0;
  datumSlanja = '';
}

export type StatusNabavke = 'otvorena' | 'zatvorena';

export class JavnaNabavka {
  _id = '';
  klijent: { _id: string; nazivInstitucije: string; grad: string } | string = '';
  stavke: TrazenaStavka[] = [];
  datumRaspisivanja = '';
  rokIsteka = '';
  status: StatusNabavke = 'otvorena';
  pobednik: { _id: string; nazivInstitucije: string } | string | null = null;
  ukupanIznosPobednika: number | null = null;
  // Dodaje backend samo u /stampar/:id odgovoru - sopstvena ponuda ako postoji.
  mojaPonuda?: Ponuda | null;
}
