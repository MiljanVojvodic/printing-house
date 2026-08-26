import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService, GrupaStamparije } from '../services/cart-service';
import { InvoiceService } from '../services/invoice-service';
import { JavnaNabavkaService } from '../services/javna-nabavka-service';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-korpa-component',
  imports: [RouterLink],
  templateUrl: './korpa-component.html',
  styleUrl: './korpa-component.css',
})
export class KorpaComponent implements OnInit {
  private cartService = inject(CartService);
  private invoiceService = inject(InvoiceService);
  private javnaNabavkaService = inject(JavnaNabavkaService);
  private authService = inject(AuthService);

  grupe: GrupaStamparije[] = [];
  poruka = '';
  uspesnaPoruka = '';
  potvrdjivanjeUToku = false;

  ngOnInit(): void {
    this.grupe = this.cartService.grupisanoPoStampariji();
  }

  get ukupanIznos(): number {
    return this.cartService.ukupanIznos();
  }

  get jePravnoLice(): boolean {
    return this.authService.trenutniKorisnik()?.tip === 'pravno';
  }

  potvrdi() {
    const korisnik = this.authService.trenutniKorisnik();
    if (!korisnik) return;

    this.poruka = '';
    this.potvrdjivanjeUToku = true;

    // Pravno lice: umesto faktura, potvrda u e-korpi pokrece javnu nabavku
    // (licitaciju) - vidi tekst zadatka, odeljak "Javne nabavke".
    if (korisnik.tip === 'pravno') {
      this.javnaNabavkaService
        .pokreni(korisnik._id, this.cartService.sveStavke())
        .subscribe({
          next: (resp) => {
            this.potvrdjivanjeUToku = false;
            this.cartService.isprazni();
            this.grupe = [];
            this.uspesnaPoruka = resp.message;
          },
          error: (err) => {
            this.potvrdjivanjeUToku = false;
            this.poruka =
              err?.error?.message || 'Doslo je do greske prilikom raspisivanja javne nabavke.';
          },
        });
      return;
    }

    this.invoiceService
      .potvrdiNarudzbinu(korisnik._id, this.cartService.sveStavke())
      .subscribe({
        next: (resp) => {
          this.potvrdjivanjeUToku = false;
          this.cartService.isprazni();
          this.grupe = [];
          this.uspesnaPoruka = resp.message;
        },
        error: (err) => {
          this.potvrdjivanjeUToku = false;
          this.poruka = err?.error?.message || 'Doslo je do greske prilikom potvrde narudzbine.';
        },
      });
  }
}
