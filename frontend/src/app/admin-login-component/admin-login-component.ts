import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user-service';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-admin-login-component',
  imports: [FormsModule],
  templateUrl: './admin-login-component.html',
  styleUrl: './admin-login-component.css',
})
export class AdminLoginComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  kor_ime: string = '';
  lozinka: string = '';
  poruka: string = '';

  prijavaAdmina() {
    this.poruka = '';
    this.userService.adminPrijava(this.kor_ime, this.lozinka).subscribe({
      next: (korisnik) => {
        this.authService.postaviUlogovanog(korisnik);
        this.router.navigateByUrl(this.authService.pocetnaRutaZaTip(korisnik.tip));
      },
      error: (err) => {
        this.poruka = err?.error?.message || 'Doslo je do greske prilikom prijave.';
      },
    });
  }
}
