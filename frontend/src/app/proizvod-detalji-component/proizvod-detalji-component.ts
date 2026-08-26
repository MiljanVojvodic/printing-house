import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ProductService } from '../services/product-service';
import { AuthService } from '../services/auth-service';
import { RecenzijaService } from '../services/recenzija-service';
import { Proizvod } from '../models/proizvod';
import { Recenzija } from '../models/recenzija';
import { UPLOADS_URL } from '../services/api-config';

// Javno vidljiva strana detalja proizvoda (naziv, stamparija, grad,
// lajkovi/dislajkovi, glavna slika). Za ulogovanog klijenta (fizicko/
// pravno) prikazuje se i prosireni deo: cena, boja, tipovi stampe i
// dugme DALJE ka stranici pripreme proizvoda (Faza 4).
@Component({
  selector: 'app-proizvod-detalji-component',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './proizvod-detalji-component.html',
  styleUrl: './proizvod-detalji-component.css',
})
export class ProizvodDetaljiComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private recenzijaService = inject(RecenzijaService);

  proizvod: Proizvod | null = null;
  ucitavanjeNeuspesno = false;
  komentari: Recenzija[] = [];

  odabranaBoja = '';
  odabraniTipStampe = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.ucitavanjeNeuspesno = true;
      return;
    }
    this.productService.dohvatiPoId(id).subscribe({
      next: (p) => {
        this.proizvod = p;
        this.odabranaBoja = p.boje.length > 0 ? p.boje[0] : 'Bela';
      },
      error: () => (this.ucitavanjeNeuspesno = true),
    });
    this.recenzijaService.poslednjiKomentari(id).subscribe((k) => {
      this.komentari = k;
    });
  }

  get mojKorIme(): string {
    return this.authService.trenutniKorisnik()?.kor_ime || '';
  }

  get glavnaSlikaUrl(): string | null {
    if (!this.proizvod || this.proizvod.slike.length === 0) return null;
    return `${UPLOADS_URL}/${this.proizvod.slike[0]}`;
  }

  get jeKlijent(): boolean {
    return this.authService.imaUlogu('fizicko', 'pravno');
  }

  get bojeZaPrikaz(): string[] {
    return this.proizvod && this.proizvod.boje.length > 0
      ? this.proizvod.boje
      : ['Bela'];
  }

  dalje() {
    if (!this.proizvod) return;
    this.router.navigate(['/proizvodi', this.proizvod._id, 'priprema'], {
      queryParams: {
        boja: this.odabranaBoja,
        tipStampe: this.odabraniTipStampe,
      },
    });
  }
}
