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
  kreator = '';
  kolicinaNaStanju = 0;
  slike: string[] = [];
  boje: string[] = ['Bela'];
  tipoviStampe: TipStampe[] = [];
  lajkovi = 0;
  dislajkovi = 0;

  nazivStamparije = '';
  gradStamparije = '';
}
