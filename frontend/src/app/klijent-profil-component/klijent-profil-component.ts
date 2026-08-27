import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { UserService } from '../services/user-service';
import { InvoiceService } from '../services/invoice-service';
import { Korisnik } from '../models/korisnik';
import { Invoice } from '../models/invoice';
import { UPLOADS_URL } from '../services/api-config';

type SortKolona = 'datumNarudzbine' | 'nazivStamparije' | 'grad' | 'ukupanIznos' | 'status';

@Component({
  selector: 'app-klijent-profil-component',
  imports: [FormsModule, NgClass],
  templateUrl: './klijent-profil-component.html',
  styleUrl: './klijent-profil-component.css',
})
export class KlijentProfilComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private invoiceService = inject(InvoiceService);

  korisnik: Korisnik = new Korisnik();
  slikaFajl: File | null = null;
  poruka = '';
  uspesnaPoruka = '';
  cuvanjeUToku = false;

  fakture: Invoice[] = [];
  private sortKolona: SortKolona = 'datumNarudzbine';
  private sortRastuce = false;

  readonly UPLOADS_URL = UPLOADS_URL;

  ngOnInit(): void {
    const ulogovan = this.authService.trenutniKorisnik();
    if (!ulogovan) return;
    this.korisnik = { ...ulogovan };

    this.invoiceService.mojeNarudzbine(ulogovan._id).subscribe((f) => {
      this.fakture = f;
      this.sortiraj(this.sortKolona, true);
    });
  }

  get jePravnoLice() {
    return this.korisnik.tip === 'pravno';
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
    if (this.jePravnoLice) {
      podaci.append('nazivInstitucije', this.korisnik.nazivInstitucije);
      podaci.append('adresa', this.korisnik.adresa);
      podaci.append('grad', this.korisnik.grad);
    }
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

  sortiraj(kolona: SortKolona, zadrziRedosled = false) {
    if (!zadrziRedosled) {
      this.sortRastuce = this.sortKolona === kolona ? !this.sortRastuce : true;
    }
    this.sortKolona = kolona;

    this.fakture = [...this.fakture].sort((a, b) => {
      const va = this.vrednostZaSortiranje(a, kolona);
      const vb = this.vrednostZaSortiranje(b, kolona);
      const rezultat = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'sr');
      return this.sortRastuce ? rezultat : -rezultat;
    });
  }

  private vrednostZaSortiranje(f: Invoice, kolona: SortKolona): string | number {
    if (kolona === 'ukupanIznos') return f.ukupanIznos;
    if (kolona === 'datumNarudzbine') return f.datumNarudzbine;
    if (kolona === 'status') return this.statusNaziv(f.status);
    if (typeof f.stampar === 'object') {
      return kolona === 'grad' ? f.stampar.grad : f.stampar.nazivInstitucije;
    }
    return '';
  }

  nazivStamparije(f: Invoice): string {
    return typeof f.stampar === 'object' ? f.stampar.nazivInstitucije : '';
  }

  gradStamparije(f: Invoice): string {
    return typeof f.stampar === 'object' ? f.stampar.grad : '';
  }

  statusNaziv(status: string): string {
    const nazivi: Record<string, string> = {
      naruceno: 'Naručeno',
      u_stampi: 'U štampi',
      isporuceno: 'Isporučeno',
      primljeno: 'Primljeno',
    };
    return nazivi[status] || status;
  }
}
