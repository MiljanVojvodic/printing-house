import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../services/user-service';
import { Korisnik } from '../models/korisnik';

@Component({
  selector: 'app-admin-zahtevi-component',
  imports: [],
  templateUrl: './admin-zahtevi-component.html',
  styleUrl: './admin-zahtevi-component.css',
})
export class AdminZahteviComponent implements OnInit {
  private userService = inject(UserService);

  zahtevi: Korisnik[] = [];
  poruka = '';

  ngOnInit(): void {
    this.ucitaj();
  }

  private ucitaj() {
    this.userService.naCekanju().subscribe((z) => (this.zahtevi = z));
  }

  tipNaziv(tip: string): string {
    const nazivi: Record<string, string> = {
      fizicko: 'Klijent (fizičko lice)',
      pravno: 'Klijent (pravno lice)',
      stampar: 'Štamparija',
    };
    return nazivi[tip] || tip;
  }

  prihvati(k: Korisnik) {
    this.poruka = '';
    this.userService.azurirajStatus(k.kor_ime, 'odobren').subscribe({
      next: () => {
        this.zahtevi = this.zahtevi.filter((z) => z.kor_ime !== k.kor_ime);
      },
      error: (err) => {
        this.poruka = err?.error?.message || 'Doslo je do greske.';
      },
    });
  }

  odbij(k: Korisnik) {
    this.poruka = '';
    this.userService.azurirajStatus(k.kor_ime, 'odbijen').subscribe({
      next: () => {
        this.zahtevi = this.zahtevi.filter((z) => z.kor_ime !== k.kor_ime);
      },
      error: (err) => {
        this.poruka = err?.error?.message || 'Doslo je do greske.';
      },
    });
  }
}
