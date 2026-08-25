import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { ProductService } from '../services/product-service';
import { Proizvod } from '../models/proizvod';

@Component({
  selector: 'app-stampar-kolicine-component',
  imports: [FormsModule],
  templateUrl: './stampar-kolicine-component.html',
  styleUrl: './stampar-kolicine-component.css',
})
export class StamparKolicineComponent implements OnInit {
  private authService = inject(AuthService);
  private productService = inject(ProductService);

  proizvodi: Proizvod[] = [];
  unetaKolicina: Record<string, number> = {};
  porukaPoProizvodu: Record<string, string> = {};

  ngOnInit(): void {
    const korisnik = this.authService.trenutniKorisnik();
    if (!korisnik) return;
    this.productService.dohvatiZaStampariju(korisnik.kor_ime).subscribe((p) => {
      this.proizvodi = p;
      for (const proizvod of p) {
        this.unetaKolicina[proizvod._id] = proizvod.kolicinaNaStanju;
      }
    });
  }

  sacuvaj(proizvod: Proizvod) {
    const korisnik = this.authService.trenutniKorisnik();
    if (!korisnik) return;

    const novaKolicina = this.unetaKolicina[proizvod._id];
    this.porukaPoProizvodu[proizvod._id] = '';

    this.productService
      .azurirajKolicinu(proizvod._id, novaKolicina, korisnik.kor_ime)
      .subscribe({
        next: (azuriran) => {
          proizvod.kolicinaNaStanju = azuriran.kolicinaNaStanju;
          this.porukaPoProizvodu[proizvod._id] = 'Sačuvano.';
        },
        error: (err) => {
          this.porukaPoProizvodu[proizvod._id] =
            err?.error?.message || 'Greška prilikom čuvanja.';
        },
      });
  }
}
