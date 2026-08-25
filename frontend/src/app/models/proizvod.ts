export class TipStampe {
  naziv = '';
  maxSirinaMm = 0;
  maxVisinaMm = 0;
  dodatnaCenaPoKomadu = 0;
}

export class Proizvod {
  _id = '';
  naziv = '';
  kratakOpis = '';
  duziOpis = '';
  cena = 0;
  kategorija = '';
  podkategorija = '';
  kreator = ''; // kor_ime stamparije
  kolicinaNaStanju = 0;
  slike: string[] = [];
  boje: string[] = ['Bela'];
  tipoviStampe: TipStampe[] = [];
  lajkovi = 0;
  dislajkovi = 0;

  // Dodaje backend uz proizvod (nije deo Mongo seme) radi prikaza bez
  // dodatnog pretrazivanja korisnika na frontendu.
  nazivStamparije = '';
  gradStamparije = '';
}
