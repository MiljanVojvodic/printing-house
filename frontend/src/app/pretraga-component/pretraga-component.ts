import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../services/product-service';
import { CategoryService } from '../services/category-service';
import { Proizvod } from '../models/proizvod';
import { Kategorija } from '../models/kategorija';

// Deljena komponenta za pretragu proizvoda - koristi je i nerigistrovani
// korisnik (ugradjena na pocetnoj strani) i, od Faze 4, ulogovani klijent
// (na sopstvenoj ruti /proizvodi).
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

  sortirajPoNazivu() {
    this.sortRastuce = !this.sortRastuce;
    this.rezultati = [...this.rezultati].sort((a, b) =>
      this.sortRastuce
        ? a.naziv.localeCompare(b.naziv, 'sr')
        : b.naziv.localeCompare(a.naziv, 'sr')
    );
  }
}
