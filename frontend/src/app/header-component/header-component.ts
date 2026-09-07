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

  get korisnik() {
    return this.authService.trenutniKorisnik();
  }

  get brojStavkiUKorpi() {
    return this.cartService.brojStavki();
  }

  odjaviSe() {
    const jeAdmin = this.korisnik?.tip === 'admin';
    this.authService.odjaviSe();
    this.router.navigateByUrl(jeAdmin ? '/administracija/prijava' : '/prijava');
  }
}
