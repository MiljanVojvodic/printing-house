import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../services/auth-service';
import { JavnaNabavkaService } from '../services/javna-nabavka-service';
import { JavnaNabavka } from '../models/javna-nabavka';

@Component({
  selector: 'app-stampar-licitacije-component',
  imports: [FormsModule, DatePipe],
  templateUrl: './stampar-licitacije-component.html',
  styleUrl: './stampar-licitacije-component.css',
})
export class StamparLicitacijeComponent implements OnInit {
  private authService = inject(AuthService);
  private javnaNabavkaService = inject(JavnaNabavkaService);

  nabavke: JavnaNabavka[] = [];
  unetaCena: Record<string, number> = {};
  unetaKolicina: Record<string, number> = {};
  poslatoZaNabavku: Record<string, boolean> = {};
  poruka: Record<string, string> = {};

  ngOnInit(): void {
    this.ucitaj();
  }

  private ucitaj() {
    const korisnik = this.authService.trenutniKorisnik();
    if (!korisnik) return;
    this.javnaNabavkaService.zaStampara(korisnik._id).subscribe((n) => {
      this.nabavke = n;
      for (const nabavka of n) {
        if (nabavka.mojaPonuda) {
          this.poslatoZaNabavku[nabavka._id] = true;
          for (const s of nabavka.mojaPonuda.stavke) {
            this.unetaCena[this.kljuc(nabavka._id, s.proizvod)] = s.cenaPoJedinici;
            this.unetaKolicina[this.kljuc(nabavka._id, s.proizvod)] = s.dostupnaKolicina;
          }
        }
      }
    });
  }

  kljuc(nabavkaId: string, proizvodId: string): string {
    return nabavkaId + '|' + proizvodId;
  }

  jeIstekla(n: JavnaNabavka): boolean {
    return new Date(n.rokIsteka).getTime() < Date.now();
  }

  nazivKlijenta(n: JavnaNabavka): string {
    return typeof n.klijent === 'object' ? n.klijent.nazivInstitucije : '';
  }

  nazivPobednika(n: JavnaNabavka): string {
    return typeof n.pobednik === 'object' && n.pobednik ? n.pobednik.nazivInstitucije : '';
  }

  izvestajUrl(n: JavnaNabavka): string {
    return this.javnaNabavkaService.izvestajUrl(n._id);
  }

  posaljiPonudu(n: JavnaNabavka) {
    const korisnik = this.authService.trenutniKorisnik();
    if (!korisnik) return;
    this.poruka[n._id] = '';

    const stavke = n.stavke.map((s) => ({
      proizvodId: s.proizvod,
      cenaPoJedinici: this.unetaCena[this.kljuc(n._id, s.proizvod)] || 0,
      dostupnaKolicina: this.unetaKolicina[this.kljuc(n._id, s.proizvod)] || 0,
    }));

    if (stavke.some((s) => !s.cenaPoJedinici || s.dostupnaKolicina <= 0)) {
      this.poruka[n._id] = 'Unesite cenu i dostupnu količinu za sve stavke.';
      return;
    }

    this.javnaNabavkaService.posaljiPonudu(n._id, korisnik._id, stavke).subscribe({
      next: () => {
        this.poslatoZaNabavku[n._id] = true;
      },
      error: (err) => {
        this.poruka[n._id] = err?.error?.message || 'Doslo je do greske prilikom slanja ponude.';
      },
    });
  }
}
