import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../services/user-service';

const LOZINKA_REGEX =
  /^(?=.{8,12}$)(?=[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

type StanjeProvere = 'ucitavanje' | 'validan' | 'nevalidan';

@Component({
  selector: 'app-nova-lozinka-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './nova-lozinka-component.html',
  styleUrl: './nova-lozinka-component.css',
})
export class NovaLozinkaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  private token = '';
  stanjeProvere: StanjeProvere = 'ucitavanje';

  lozinka = '';
  lozinkaPotvrda = '';
  poruka = '';
  uspesnaPoruka = '';
  slanjeUToku = false;

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.stanjeProvere = 'nevalidan';
      return;
    }
    this.userService.proveriTokenReset(this.token).subscribe({
      next: (resp) => (this.stanjeProvere = resp.validan ? 'validan' : 'nevalidan'),
      error: () => (this.stanjeProvere = 'nevalidan'),
    });
  }

  posalji(form: NgForm) {
    this.poruka = '';
    this.uspesnaPoruka = '';

    if (form.invalid) {
      this.poruka = 'Molimo popunite ispravno sva polja.';
      return;
    }
    if (!LOZINKA_REGEX.test(this.lozinka)) {
      this.poruka =
        'Lozinka mora imati 8-12 karaktera, poceti slovom, i sadrzati bar jedno veliko slovo, jedan broj i jedan specijalni karakter.';
      return;
    }
    if (this.lozinka !== this.lozinkaPotvrda) {
      this.poruka = 'Lozinke se ne poklapaju.';
      return;
    }

    this.slanjeUToku = true;
    this.userService.postaviNovuLozinku(this.token, this.lozinka).subscribe({
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
