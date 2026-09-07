import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import * as L from 'leaflet';
import { ProductService } from '../services/product-service';
import { AuthService } from '../services/auth-service';
import { RecenzijaService } from '../services/recenzija-service';
import { GradKoordinateService } from '../services/grad-koordinate-service';
import { Proizvod } from '../models/proizvod';
import { Recenzija } from '../models/recenzija';
import { UPLOADS_URL } from '../services/api-config';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-proizvod-detalji-component',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './proizvod-detalji-component.html',
  styleUrl: './proizvod-detalji-component.css',
})
export class ProizvodDetaljiComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private recenzijaService = inject(RecenzijaService);
  private gradKoordinateService = inject(GradKoordinateService);

  private mapa: L.Map | null = null;

  @ViewChild('mapaKontejner') set mapaKontejnerRef(el: ElementRef<HTMLDivElement> | undefined) {
    if (el) {
      this.inicijalizujMapu(el.nativeElement);
    }
  }

  proizvod: Proizvod | null = null;
  ucitavanjeNeuspesno = false;
  komentari: Recenzija[] = [];

  odabranaBoja = '';
  odabraniTipStampe = '';

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

  get galerijaSlike(): string[] {
    return this.proizvod ? this.proizvod.slike.slice(0, 4) : [];
  }

  get glavnaSlikaUrl(): string | null {
    const slike = this.galerijaSlike;
    return slike.length > 0 ? `${UPLOADS_URL}/${slike[this.odabraniIndeks]}` : null;
  }

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

  private inicijalizujMapu(el: HTMLDivElement) {
    if (this.mapa || !this.proizvod) return;
    const [lat, lng] = this.gradKoordinateService.koordinateZaGrad(this.proizvod.gradStamparije);
    this.mapa = L.map(el).setView([lat, lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(this.mapa);
    L.marker([lat, lng])
      .addTo(this.mapa)
      .bindPopup(`${this.proizvod.nazivStamparije}<br>${this.proizvod.gradStamparije}`);

    setTimeout(() => this.mapa?.invalidateSize(), 0);
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
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
