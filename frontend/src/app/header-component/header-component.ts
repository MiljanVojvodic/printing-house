import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { CartService } from '../services/cart-service';

@Component({
  selector: 'app-header-component',
  imports: [RouterLink],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  // Getter umesto polja - cita se iz localStorage pri svakoj promeni detekcije,
  // pa meni ostaje tacan i nakon logina/logouta bez dodatne sinhronizacije.
  get korisnik() {
    return this.authService.trenutniKorisnik();
  }

  get brojStavkiUKorpi() {
    return this.cartService.brojStavki();
  }

  odjaviSe() {
    // Tip citamo pre odjave (posle odjave getter vise nema koga da vrati),
    // da bismo administratora vratili na admin ekran za prijavu, a ostale
    // korisnike na obican ekran za prijavu.
    const jeAdmin = this.korisnik?.tip === 'admin';
    this.authService.odjaviSe();
    this.router.navigateByUrl(jeAdmin ? '/administracija/prijava' : '/prijava');
  }
}
