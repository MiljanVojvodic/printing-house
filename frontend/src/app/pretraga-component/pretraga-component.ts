import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../services/product-service';
import { CategoryService } from '../services/category-service';
import { Proizvod } from '../models/proizvod';
import { Kategorija } from '../models/kategorija';

@Component({
  selector: 'app-pretraga-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './pretraga-component.html',
  styleUrl: './pretraga-component.css',
})
export class PretragaComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  naziv = '';
  kategorijaOdabrana = '';
  kategorije: Kategorija[] = [];
  rezultati: Proizvod[] = [];
  pretragaIzvrsena = false;

  private sortKolona: 'naziv' | 'kategorija' | null = null;
  private sortRastuce = true;

  ngOnInit(): void {
    this.categoryService.aktivneKategorije().subscribe((kat) => {
      this.kategorije = kat;
    });
    this.pretrazi();
  }

  pretrazi() {
    this.productService.pretraga(this.naziv, this.kategorijaOdabrana).subscribe((rez) => {
      this.rezultati = rez;
      this.pretragaIzvrsena = true;
    });
  }

  sortiraj(kolona: 'naziv' | 'kategorija') {
    this.sortRastuce = this.sortKolona === kolona ? !this.sortRastuce : true;
    this.sortKolona = kolona;

    const vrednost = (p: Proizvod) =>
      kolona === 'naziv' ? p.naziv : p.podkategorija || p.kategorija;

    this.rezultati = [...this.rezultati].sort((a, b) => {
      const rezultat = vrednost(a).localeCompare(vrednost(b), 'sr');
      return this.sortRastuce ? rezultat : -rezultat;
    });
  }
}
