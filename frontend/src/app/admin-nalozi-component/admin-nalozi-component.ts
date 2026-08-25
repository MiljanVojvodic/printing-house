import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user-service';
import { Korisnik } from '../models/korisnik';

@Component({
  selector: 'app-admin-nalozi-component',
  imports: [FormsModule],
  templateUrl: './admin-nalozi-component.html',
  styleUrl: './admin-nalozi-component.css',
})
export class AdminNaloziComponent implements OnInit {
  private userService = inject(UserService);

  korisnici: Korisnik[] = [];
  korisnikUIzmeni: Korisnik | null = null;
  poruka = '';
  uspesnaPoruka = '';

  ngOnInit(): void {
    this.ucitaj();
  }

  private ucitaj() {
    this.userService.sviKorisnici().subscribe((k) => (this.korisnici = k));
  }

  get jePravniTipUIzmeni() {
    return (
      this.korisnikUIzmeni?.tip === 'pravno' ||
      this.korisnikUIzmeni?.tip === 'stampar'
    );
  }

  tipNaziv(tip: string): string {
    const nazivi: Record<string, string> = {
      fizicko: 'Klijent (fizičko lice)',
      pravno: 'Klijent (pravno lice)',
      stampar: 'Štamparija',
      admin: 'Administrator',
    };
    return nazivi[tip] || tip;
  }

  statusNaziv(status: string): string {
    const nazivi: Record<string, string> = {
      na_cekanju: 'Na čekanju',
      odobren: 'Odobren',
      odbijen: 'Odbijen',
    };
    return nazivi[status] || status;
  }

  izmeni(k: Korisnik) {
    this.poruka = '';
    this.uspesnaPoruka = '';
    this.korisnikUIzmeni = { ...k };
  }

  otkaziIzmenu() {
    this.korisnikUIzmeni = null;
  }

  sacuvajIzmenu() {
    if (!this.korisnikUIzmeni) return;
    this.poruka = '';
    this.uspesnaPoruka = '';

    const podaci = new FormData();
    podaci.append('ime', this.korisnikUIzmeni.ime);
    podaci.append('prezime', this.korisnikUIzmeni.prezime);
    podaci.append('telefon', this.korisnikUIzmeni.telefon);
    podaci.append('mejl', this.korisnikUIzmeni.mejl);
    if (this.jePravniTipUIzmeni) {
      podaci.append('nazivInstitucije', this.korisnikUIzmeni.nazivInstitucije);
      podaci.append('adresa', this.korisnikUIzmeni.adresa);
      podaci.append('grad', this.korisnikUIzmeni.grad);
    }

    this.userService.azurirajProfil(this.korisnikUIzmeni.kor_ime, podaci).subscribe({
      next: () => {
        this.uspesnaPoruka = 'Nalog je ažuriran.';
        this.korisnikUIzmeni = null;
        this.ucitaj();
      },
      error: (err) => {
        this.poruka = err?.error?.message || 'Doslo je do greske prilikom cuvanja.';
      },
    });
  }

  obrisi(k: Korisnik) {
    if (!confirm(`Da li sigurno želite da obrišete nalog "${k.kor_ime}"?`)) {
      return;
    }
    this.poruka = '';
    this.userService.obrisiNalog(k.kor_ime).subscribe({
      next: () => {
        this.korisnici = this.korisnici.filter((x) => x.kor_ime !== k.kor_ime);
      },
      error: (err) => {
        this.poruka = err?.error?.message || 'Doslo je do greske prilikom brisanja.';
      },
    });
  }
}
