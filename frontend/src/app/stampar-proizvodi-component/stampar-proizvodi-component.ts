import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { ProductService } from '../services/product-service';
import { CategoryService } from '../services/category-service';
import { Proizvod, TipStampe } from '../models/proizvod';
import { Kategorija } from '../models/kategorija';

@Component({
  selector: 'app-stampar-proizvodi-component',
  imports: [FormsModule],
  templateUrl: './stampar-proizvodi-component.html',
  styleUrl: './stampar-proizvodi-component.css',
})
export class StamparProizvodiComponent implements OnInit {
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  kategorije: Kategorija[] = [];
  sopstveniProizvodi: Proizvod[] = [];

  naziv = '';
  kratakOpis = '';
  duziOpis = '';
  cena: number | null = null;
  kolicinaNaStanju: number | null = null;
  odabranaKategorija = '';
  odabranaPodkategorija = '';
  bojeTekst = 'Bela';
  slikeFajlovi: File[] = [];

  usluge: TipStampe[] = [];
  novaUsluga = new TipStampe();

  poruka = '';
  uspesnaPoruka = '';
  slanjeUToku = false;

  ngOnInit(): void {
    this.categoryService.sveKategorije().subscribe((k) => (this.kategorije = k));
    this.ucitajSopstveneProizvode();
  }

  private ucitajSopstveneProizvode() {
    const korisnik = this.authService.trenutniKorisnik();
    if (!korisnik) return;
    this.productService.dohvatiZaStampariju(korisnik.kor_ime).subscribe((p) => {
      this.sopstveniProizvodi = p;
    });
  }

  get podkategorijeZaOdabranu() {
    const kat = this.kategorije.find((k) => k.naziv === this.odabranaKategorija);
    return kat ? kat.podkategorije : [];
  }

  promenjenaKategorija() {
    this.odabranaPodkategorija = '';
  }

  izaberiSlike(event: Event) {
    const input = event.target as HTMLInputElement;
    this.slikeFajlovi = input.files ? Array.from(input.files) : [];
  }

  dodajUslugu() {
    if (!this.novaUsluga.naziv.trim()) return;
    this.usluge = [...this.usluge, this.novaUsluga];
    this.novaUsluga = new TipStampe();
  }

  ukloniUslugu(indeks: number) {
    this.usluge = this.usluge.filter((_, i) => i !== indeks);
  }

  posaljiProizvod() {
    this.poruka = '';
    this.uspesnaPoruka = '';

    const korisnik = this.authService.trenutniKorisnik();
    if (!korisnik) return;

    if (!this.naziv || !this.cena || !this.odabranaKategorija || !this.odabranaPodkategorija) {
      this.poruka = 'Naziv, cena, kategorija i potkategorija su obavezni.';
      return;
    }

    const boje = this.bojeTekst
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const podaci = new FormData();
    podaci.append('naziv', this.naziv);
    podaci.append('kratakOpis', this.kratakOpis);
    podaci.append('duziOpis', this.duziOpis);
    podaci.append('cena', String(this.cena));
    podaci.append('kategorija', this.odabranaKategorija);
    podaci.append('podkategorija', this.odabranaPodkategorija);
    podaci.append('kreator', korisnik.kor_ime);
    podaci.append('kolicinaNaStanju', String(this.kolicinaNaStanju || 0));
    podaci.append('boje', JSON.stringify(boje.length > 0 ? boje : ['Bela']));
    podaci.append('tipoviStampe', JSON.stringify(this.usluge));
    for (const fajl of this.slikeFajlovi) {
      podaci.append('slike', fajl);
    }

    this.slanjeUToku = true;
    this.productService.dodaj(podaci).subscribe({
      next: () => {
        this.slanjeUToku = false;
        this.uspesnaPoruka = `Proizvod "${this.naziv}" je dodat.`;
        this.resetujFormu();
        this.ucitajSopstveneProizvode();
      },
      error: (err) => {
        this.slanjeUToku = false;
        this.poruka = err?.error?.message || 'Doslo je do greske prilikom dodavanja proizvoda.';
      },
    });
  }

  private resetujFormu() {
    this.naziv = '';
    this.kratakOpis = '';
    this.duziOpis = '';
    this.cena = null;
    this.kolicinaNaStanju = null;
    this.odabranaKategorija = '';
    this.odabranaPodkategorija = '';
    this.bojeTekst = 'Bela';
    this.slikeFajlovi = [];
    this.usluge = [];
    this.novaUsluga = new TipStampe();
  }
}
