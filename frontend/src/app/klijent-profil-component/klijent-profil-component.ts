import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

// Puna funkcionalnost profila i tabela porudzbina dolazi u Fazi 3.
@Component({
  selector: 'app-klijent-profil-component',
  imports: [],
  templateUrl: './klijent-profil-component.html',
  styleUrl: './klijent-profil-component.css',
})
export class KlijentProfilComponent {
  private authService = inject(AuthService);
  korisnik = this.authService.trenutniKorisnik();
}
