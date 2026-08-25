// Lozinka: 8-12 karaktera, mora poceti slovom, sadrzi bar jedno veliko slovo,
// jedan broj i jedan specijalni karakter (pocetno slovo se racuna i u ove uslove).
export const LOZINKA_REGEX =
  /^(?=.{8,12}$)(?=[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

// Maticni broj institucije: tacno 8 cifara.
export const MATICNI_BROJ_REGEX = /^\d{8}$/;

// PIB: tacno 9 cifara, ne pocinje nulom.
export const PIB_REGEX = /^[1-9]\d{8}$/;

export const MEJL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validacionePoruke(): Record<string, string> {
  return {
    lozinka:
      "Lozinka mora imati 8-12 karaktera, poceti slovom, i sadrzati bar jedno veliko slovo, jedan broj i jedan specijalni karakter.",
    maticniBroj: "Maticni broj mora imati tacno 8 cifara.",
    pib: "PIB mora imati tacno 9 cifara i ne sme poceti nulom.",
    mejl: "Neispravna e-mejl adresa.",
  };
}
