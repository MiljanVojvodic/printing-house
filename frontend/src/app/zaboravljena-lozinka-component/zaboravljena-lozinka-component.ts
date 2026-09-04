import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../services/user-service';

@Component({
  selector: 'app-zaboravljena-lozinka-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './zaboravljena-lozinka-component.html',
  styleUrl: './zaboravljena-lozinka-component.css',
})
export class ZaboravljenaLozinkaComponent {
  private userService = inject(UserService);

  korIsmeIliMejl = '';
  poruka = '';
  uspesnaPoruka = '';
  slanjeUToku = false;

  posalji(form: NgForm) {
    this.poruka = '';
    this.uspesnaPoruka = '';

    if (form.invalid) {
      this.poruka = 'Unesite korisničko ime ili mejl adresu.';
      return;
    }

    this.slanjeUToku = true;
    this.userService.zatraziResetLozinke(this.korIsmeIliMejl).subscribe({
      next: (resp) => {
        this.slanjeUToku = false;
        this.uspesnaPoruka = resp.message;
      },
      error: (err) => {
        this.slanjeUToku = false;
        this.poruka = err?.error?.message || 'Došlo je do greške.';
      },
    });
  }
}
