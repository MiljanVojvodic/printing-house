import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../services/product-service';
import { Proizvod } from '../models/proizvod';
import { Korisnik } from '../models/korisnik';

@Component({
  selector: 'app-radnik-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './radnik-component.html',
  styleUrl: './radnik-component.css',
})
export class RadnikComponent {
private productService = inject(ProductService)
  
  ngOnInit(): void {
    let korisnik = localStorage.getItem("ulogovan");
    if (korisnik != null)
      this.ulogovan = JSON.parse(korisnik);
    this.productService.dohvatiSveProizvodeNaCekanju().subscribe((p) => {
      this.proizvodi = p;
    })
  }

  odjaviSe() {
    localStorage.clear()
  }

  proizvodi: Proizvod[] = [];
  ulogovan: Korisnik = new Korisnik();
  poruka: string = "";

  odobri(p: Proizvod) {
    if (p.cena <= 0) {
      this.poruka = "Cena mora biti pozitivan broj."
    } else {
      this.productService.promeniStatusProizvoda(p.idP, p.cena, "u prodavnici").subscribe((resp) => {
        this.productService.dohvatiSveProizvodeNaCekanju().subscribe((pr) => {
          this.proizvodi = pr;
          this.poruka = "Proizvod " + p.naziv + " je odobren.";
        })
      })
    }
  }

  odbij(p: Proizvod) {
    this.productService.promeniStatusProizvoda(p.idP, 0, "odbijeno").subscribe((resp) => {
      this.productService.dohvatiSveProizvodeNaCekanju().subscribe((pr) => {
        this.proizvodi = pr;
        this.poruka = "Proizvod " + p.naziv + " je odbijen.";
      })
    })
  }
}
