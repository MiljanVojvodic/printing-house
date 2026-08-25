export type TipKorisnika = 'fizicko' | 'pravno' | 'stampar' | 'admin' | '';
export type StatusKorisnika = 'na_cekanju' | 'odobren' | 'odbijen' | '';

export class Korisnik {
  _id = '';
  kor_ime = '';
  ime = '';
  prezime = '';
  telefon = '';
  mejl = '';
  slika = '';
  tip: TipKorisnika = '';
  status: StatusKorisnika = '';

  // Samo za tip: 'pravno' i 'stampar'
  nazivInstitucije = '';
  adresa = '';
  grad = '';
  maticniBroj = '';
  pib = '';
}
