export type TipReakcije = 'lajk' | 'dislajk';

export class Recenzija {
  _id = '';
  proizvod = '';
  klijent = '';
  korIsmenaKlijenta = '';
  tipReakcije: TipReakcije = 'lajk';
  tekst = '';
  datum = '';
}
