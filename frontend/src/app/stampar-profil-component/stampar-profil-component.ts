import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { UserService } from '../services/user-service';
import { Korisnik } from '../models/korisnik';
import { UPLOADS_URL } from '../services/api-config';

// Isti obrazac kao KlijentProfilComponent (Faza 3), bez tabele porudzbina -
// naruceni proizvodi stampara imaju svoju posebnu stranicu.
@Component({
  selector: 'app-stampar-profil-component',
  imports: [FormsModule],
  templateUrl: './stampar-profil-component.html',
  styleUrl: './stampar-profil-component.css',
})
export class StamparProfilComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  korisnik: Korisnik = new Korisnik();
  slikaFajl: File | null = null;
  poruka = '';
  uspesnaPoruka = '';
  cuvanjeUToku = false;

  readonly UPLOADS_URL = UPLOADS_URL;

  ngOnInit(): void {
    const ulogovan = this.authService.trenutniKorisnik();
    if (!ulogovan) return;
    this.korisnik = { ...ulogovan };
  }

  izaberiSliku(event: Event) {
    const input = event.target as HTMLInputElement;
    this.slikaFajl = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  sacuvajProfil() {
    this.poruka = '';
    this.uspesnaPoruka = '';

    const podaci = new FormData();
    podaci.append('ime', this.korisnik.ime);
    podaci.append('prezime', this.korisnik.prezime);
    podaci.append('telefon', this.korisnik.telefon);
    podaci.append('mejl', this.korisnik.mejl);
    podaci.append('nazivInstitucije', this.korisnik.nazivInstitucije);
    podaci.append('adresa', this.korisnik.adresa);
    podaci.append('grad', this.korisnik.grad);
    if (this.slikaFajl) {
      podaci.append('slika', this.slikaFajl);
    }

    this.cuvanjeUToku = true;
    this.userService.azurirajProfil(this.korisnik.kor_ime, podaci).subscribe({
      next: (azuriran) => {
        this.cuvanjeUToku = false;
        this.korisnik = azuriran;
        this.authService.postaviUlogovanog(azuriran);
        this.slikaFajl = null;
        this.uspesnaPoruka = 'Podaci su sacuvani.';
      },
      error: (err) => {
        this.cuvanjeUToku = false;
        this.poruka = err?.error?.message || 'Doslo je do greske prilikom cuvanja.';
      },
    });
  }
}
