import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-header-component',
  imports: [RouterLink],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Getter umesto polja - cita se iz localStorage pri svakoj promeni detekcije,
  // pa meni ostaje tacan i nakon logina/logouta bez dodatne sinhronizacije.
  get korisnik() {
    return this.authService.trenutniKorisnik();
  }

  odjaviSe() {
    this.authService.odjaviSe();
    this.router.navigateByUrl('/');
  }
}
