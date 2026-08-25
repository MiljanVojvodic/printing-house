import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product-service';
import { CartService } from '../services/cart-service';
import { Proizvod } from '../models/proizvod';
import { StavkaKorpe } from '../models/stavka-korpe';

@Component({
  selector: 'app-proizvod-priprema-component',
  imports: [FormsModule],
  templateUrl: './proizvod-priprema-component.html',
  styleUrl: './proizvod-priprema-component.css',
})
export class ProizvodPripremaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  proizvod: Proizvod | null = null;
  proizvodId = '';
  boja = '';
  tipStampe = '';

  tekstPersonalizacije = '';
  kolicina = 1;
  poruka = '';

  ngOnInit(): void {
    this.proizvodId = this.route.snapshot.paramMap.get('id') || '';
    this.boja = this.route.snapshot.queryParamMap.get('boja') || 'Bela';
    this.tipStampe = this.route.snapshot.queryParamMap.get('tipStampe') || '';

    this.productService.dohvatiPoId(this.proizvodId).subscribe((p) => {
      this.proizvod = p;
    });
  }

  get cenaPoJedinici(): number {
    if (!this.proizvod) return 0;
    const tip = this.proizvod.tipoviStampe.find((t) => t.naziv === this.tipStampe);
    return this.proizvod.cena + (tip ? tip.dodatnaCenaPoKomadu : 0);
  }

  get ukupnaCena(): number {
    return this.cenaPoJedinici * (this.kolicina || 0);
  }

  dodajUKorpu() {
    this.poruka = '';
    if (!this.proizvod) return;

    if (!this.kolicina || this.kolicina <= 0) {
      this.poruka = 'Unesite ispravnu kolicinu.';
      return;
    }
    if (this.kolicina > this.proizvod.kolicinaNaStanju) {
      this.poruka = 'Nema dovoljno proizvoda trenutno na stanju.';
      return;
    }

    const stavka = new StavkaKorpe();
    stavka.proizvodId = this.proizvod._id;
    stavka.naziv = this.proizvod.naziv;
    stavka.kolicina = this.kolicina;
    stavka.cenaPoJedinici = this.cenaPoJedinici;
    stavka.boja = this.boja;
    stavka.tipStampe = this.tipStampe;
    stavka.tekstPersonalizacije = this.tekstPersonalizacije;
    stavka.ukupnaCenaStavke = this.ukupnaCena;
    stavka.stamparijaKorIme = this.proizvod.kreator;
    stavka.nazivStamparije = this.proizvod.nazivStamparije;
    stavka.gradStamparije = this.proizvod.gradStamparije;

    this.cartService.dodaj(stavka);
    this.router.navigateByUrl('/korpa');
  }

  ponisti() {
    this.tekstPersonalizacije = '';
    this.kolicina = 1;
    this.poruka = '';
  }

  nazad() {
    this.router.navigate(['/proizvodi', this.proizvodId]);
  }
}
