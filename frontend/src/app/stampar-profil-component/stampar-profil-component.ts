import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

// Puna funkcionalnost profila stampara dolazi u Fazi 5.
@Component({
  selector: 'app-stampar-profil-component',
  imports: [],
  templateUrl: './stampar-profil-component.html',
  styleUrl: './stampar-profil-component.css',
})
export class StamparProfilComponent {
  private authService = inject(AuthService);
  korisnik = this.authService.trenutniKorisnik();
}
