import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

// Prava tabela zahteva na cekanju sa prihvati/odbij akcijama dolazi u Fazi 6.
@Component({
  selector: 'app-admin-zahtevi-component',
  imports: [],
  templateUrl: './admin-zahtevi-component.html',
  styleUrl: './admin-zahtevi-component.css',
})
export class AdminZahteviComponent {
  private authService = inject(AuthService);
  korisnik = this.authService.trenutniKorisnik();
}
