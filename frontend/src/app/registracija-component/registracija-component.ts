import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../services/user-service';
import { TipKorisnika } from '../models/korisnik';

const LOZINKA_REGEX =
  /^(?=.{8,12}$)(?=[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
const MATICNI_BROJ_REGEX = /^\d{8}$/;
const PIB_REGEX = /^[1-9]\d{8}$/;
const DOZVOLJENI_TIPOVI_SLIKE = ['image/jpeg', 'image/png', 'image/gif'];

@Component({
  selector: 'app-registracija-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './registracija-component.html',
  styleUrl: './registracija-component.css',
})
export class RegistracijaComponent {
  private userService = inject(UserService);

  tip: TipKorisnika = 'fizicko';
  kor_ime = '';
  lozinka = '';
  lozinkaPotvrda = '';
  ime = '';
  prezime = '';
  telefon = '';
  mejl = '';
  nazivInstitucije = '';
  adresa = '';
  grad = '';
  maticniBroj = '';
  pib = '';
  slikaFajl: File | null = null;

  poruka = '';
  uspesnaPoruka = '';
  slanjeUToku = false;

  get jePravnoLiceIliStampar() {
    return this.tip === 'pravno' || this.tip === 'stampar';
  }

  izaberiSliku(event: Event) {
    const input = event.target as HTMLInputElement;
    this.slikaFajl = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  posalji(form: NgForm) {
    this.poruka = '';
    this.uspesnaPoruka = '';

    if (form.invalid) {
      this.poruka = 'Molimo popunite ispravno sva obavezna polja.';
      return;
    }
    if (!LOZINKA_REGEX.test(this.lozinka)) {
      this.poruka =
        'Lozinka mora imati 8-12 karaktera, poceti slovom, i sadrzati bar jedno veliko slovo, jedan broj i jedan specijalni karakter.';
      return;
    }
    if (this.lozinka !== this.lozinkaPotvrda) {
      this.poruka = 'Lozinke se ne poklapaju.';
      return;
    }
    if (this.jePravnoLiceIliStampar) {
      if (!MATICNI_BROJ_REGEX.test(this.maticniBroj)) {
        this.poruka = 'Maticni broj mora imati tacno 8 cifara.';
        return;
      }
      if (!PIB_REGEX.test(this.pib)) {
        this.poruka = 'PIB mora imati tacno 9 cifara i ne sme poceti nulom.';
        return;
      }
    }
    if (this.slikaFajl && !DOZVOLJENI_TIPOVI_SLIKE.includes(this.slikaFajl.type)) {
      this.poruka = 'Slika mora biti u JPG, PNG ili GIF formatu.';
      return;
    }

    const podaci = new FormData();
    podaci.append('kor_ime', this.kor_ime);
    podaci.append('lozinka', this.lozinka);
    podaci.append('ime', this.ime);
    podaci.append('prezime', this.prezime);
    podaci.append('telefon', this.telefon);
    podaci.append('mejl', this.mejl);
    podaci.append('tip', this.tip);
    if (this.jePravnoLiceIliStampar) {
      podaci.append('nazivInstitucije', this.nazivInstitucije);
      podaci.append('adresa', this.adresa);
      podaci.append('grad', this.grad);
      podaci.append('maticniBroj', this.maticniBroj);
      podaci.append('pib', this.pib);
    }
    if (this.slikaFajl) {
      podaci.append('slika', this.slikaFajl);
    }

    this.slanjeUToku = true;
    this.userService.registruj(podaci).subscribe({
      next: (resp) => {
        this.slanjeUToku = false;
        this.uspesnaPoruka = resp.message;
        form.resetForm({ tip: 'fizicko' });
        this.slikaFajl = null;
      },
      error: (err) => {
        this.slanjeUToku = false;
        this.poruka =
          err?.error?.message || 'Doslo je do greske prilikom registracije.';
      },
    });
  }
}
