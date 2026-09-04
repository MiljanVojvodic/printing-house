import { Injectable } from '@angular/core';

// Baza ne cuva geografske koordinate stamparije, samo naziv grada (string).
// Tekst projekta trazi da mapa pokazuje "gde se stamparija nalazi" - dovoljna
// je preciznost na nivou grada (centar grada), pa se ne uvodi zavisnost od
// spoljnog geokodiranje servisa (koji ima limit poziva) - koordinate
// najcescih srpskih gradova su ovde stalno upisane. Ako grad nije na listi,
// koristi se centar Srbije kao razuman fallback.
const KOORDINATE_GRADOVA: Record<string, [number, number]> = {
  Beograd: [44.7866, 20.4489],
  'Novi Sad': [45.2671, 19.8335],
  Niš: [43.3209, 21.8958],
  Kruševac: [43.5804, 21.3345],
  Kragujevac: [44.0128, 20.9114],
  Subotica: [46.1005, 19.6651],
  Zrenjanin: [45.3814, 20.3757],
  Pančevo: [44.8708, 20.6403],
  Čačak: [43.8914, 20.3497],
  Kraljevo: [43.7257, 20.6896],
  'Novi Pazar': [43.1367, 20.5122],
  Leskovac: [42.9981, 21.9462],
  Užice: [43.8563, 19.8425],
  Vranje: [42.5503, 21.8983],
  Šabac: [44.7492, 19.6906],
  Sombor: [45.7742, 19.1122],
  Valjevo: [44.2708, 19.8908],
  Zaječar: [43.9038, 22.2848],
  Smederevo: [44.6636, 20.9280],
  'Sremska Mitrovica': [44.9755, 19.6122],
};

const CENTAR_SRBIJE: [number, number] = [44.0165, 21.0059];

@Injectable({
  providedIn: 'root',
})
export class GradKoordinateService {
  koordinateZaGrad(grad: string | undefined | null): [number, number] {
    if (!grad) return CENTAR_SRBIJE;
    return KOORDINATE_GRADOVA[grad.trim()] || CENTAR_SRBIJE;
  }
}
