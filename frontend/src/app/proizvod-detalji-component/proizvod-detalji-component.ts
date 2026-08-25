import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../services/product-service';
import { Proizvod } from '../models/proizvod';
import { UPLOADS_URL } from '../services/api-config';

// Javno vidljiva strana detalja proizvoda (naziv, stamparija, grad,
// lajkovi/dislajkovi, glavna slika). Prosireni prikaz za ulogovanog
// klijenta (cena, boja, tipovi stampe...) dolazi u Fazi 4 - na ISTOJ
// ruti/komponenti, uslovno prikazan.
@Component({
  selector: 'app-proizvod-detalji-component',
  imports: [RouterLink],
  templateUrl: './proizvod-detalji-component.html',
  styleUrl: './proizvod-detalji-component.css',
})
export class ProizvodDetaljiComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  proizvod: Proizvod | null = null;
  ucitavanjeNeuspesno = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.ucitavanjeNeuspesno = true;
      return;
    }
    this.productService.dohvatiPoId(id).subscribe({
      next: (p) => (this.proizvod = p),
      error: () => (this.ucitavanjeNeuspesno = true),
    });
  }

  get glavnaSlikaUrl(): string | null {
    if (!this.proizvod || this.proizvod.slike.length === 0) return null;
    return `${UPLOADS_URL}/${this.proizvod.slike[0]}`;
  }
}
