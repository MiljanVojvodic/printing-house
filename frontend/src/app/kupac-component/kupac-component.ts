import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../services/user-service';
import { ProductService } from '../services/product-service';
import { Proizvod } from '../models/proizvod';
import { Korisnik } from '../models/korisnik';

@Component({
  selector: 'app-kupac-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './kupac-component.html',
  styleUrl: './kupac-component.css',
})
export class KupacComponent {
ngOnInit(): void {
    let korisnik = localStorage.getItem('ulogovan');
    if (korisnik != null) this.ulogovan = JSON.parse(korisnik);

    this.productService
      .dohvatiSveProizvodeUProdavnici()
      .subscribe((p) => {
        this.proizvodi = p;
        this.proizvodi.sort((p1, p2) => {
          return p2.lajkovi - p1.lajkovi;
        });
        this.proizvodi.forEach((p) => {
          this.userService
            .dohvatiKorisnika(p.kreator)
            .subscribe((k) => {
              p.imeKreatora = k.ime;
              p.prezimeKreatora = k.prezime;
            });
        });
      });
  }

  private userService = inject(UserService)
  private productService = inject(ProductService)

  proizvodi: Proizvod[] = [];
  ulogovan: Korisnik = new Korisnik();
  naziv: string = '';
  opis: string = '';
  poruka: string = '';

  odjaviSe() {
    localStorage.clear();
  }

  lajkuj(p: Proizvod) {
    this.productService.lajkuj(p.idP).subscribe((resp: any) => {
      if (resp['msg']) {
        p.lajkovi++;
        this.proizvodi.sort((p1, p2) => {
          return p2.lajkovi - p1.lajkovi;
        });
      }
    });
  }

  dodajProizvod() {
    this.productService
      .dodajProizvod(this.naziv, this.opis, this.ulogovan.kor_ime)
      .subscribe((resp) => {
        this.poruka = 'Proizvod ' + this.naziv + ' je dodat';
      });
  }
}
