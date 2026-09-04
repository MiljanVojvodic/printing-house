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

  // Galerija: glavna slika + do 3 dodatne (tzv. thumbnail) - vidi tekst
  // projekta. Izbor korisnika (koja je trenutno "glavna") se pamti u
  // kolacicu veb pregledaca, po proizvodu, i ucitava pri sledecoj poseti.
  odabraniIndeks = 0;

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
        this.odabraniIndeks = this.ucitajOdabraniIndeksIzKolacica(id, p.slike.length);
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

  // Tekst projekta trazi glavnu sliku + najvise 3 dodatne (ukupno do 4).
  get galerijaSlike(): string[] {
    return this.proizvod ? this.proizvod.slike.slice(0, 4) : [];
  }

  get glavnaSlikaUrl(): string | null {
    const slike = this.galerijaSlike;
    return slike.length > 0 ? `${UPLOADS_URL}/${slike[this.odabraniIndeks]}` : null;
  }

  // Thumbnail traka prikazuje ostale slike iz galerije (ne i trenutno
  // odabranu glavnu) - klik na jednu je "uvecava", tj. postavlja kao glavnu.
  get dodatneSlike(): { url: string; indeks: number }[] {
    return this.galerijaSlike
      .map((s, i) => ({ url: `${UPLOADS_URL}/${s}`, indeks: i }))
      .filter((s) => s.indeks !== this.odabraniIndeks);
  }

  izaberiSliku(indeks: number) {
    if (!this.proizvod) return;
    this.odabraniIndeks = indeks;
    document.cookie = `glavna_slika_${this.proizvod._id}=${indeks}; path=/; max-age=31536000`;
  }

  private ucitajOdabraniIndeksIzKolacica(proizvodId: string, brojSlika: number): number {
    const par = document.cookie
      .split('; ')
      .find((red) => red.startsWith(`glavna_slika_${proizvodId}=`));
    if (!par) return 0;
    const vrednost = Number(par.split('=')[1]);
    const maksIndeks = Math.min(brojSlika, 4) - 1;
    return Number.isInteger(vrednost) && vrednost >= 0 && vrednost <= maksIndeks ? vrednost : 0;
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
