import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { InvoiceService } from '../services/invoice-service';
import { RecenzijaService } from '../services/recenzija-service';
import { Invoice, StatusFakture } from '../models/invoice';
import { TipReakcije } from '../models/recenzija';

class RedArhive {
  invoiceId = '';
  proizvodId = '';
  naziv = '';
  kolicina = 0;
  nazivStamparije = '';
  gradStamparije = '';
  datumNarudzbine = '';
  status: StatusFakture = 'isporuceno';
}

type SortKolona = 'datumNarudzbine' | 'naziv' | 'kolicina' | 'nazivStamparije';

@Component({
  selector: 'app-arhiva-proizvoda-component',
  imports: [FormsModule, DatePipe],
  templateUrl: './arhiva-proizvoda-component.html',
  styleUrl: './arhiva-proizvoda-component.css',
})
export class ArhivaProizvodaComponent implements OnInit {
  private authService = inject(AuthService);
  private invoiceService = inject(InvoiceService);
  private recenzijaService = inject(RecenzijaService);

  redovi: RedArhive[] = [];
  odabranaReakcija: Record<string, TipReakcije> = {};
  unetTekst: Record<string, string> = {};
  poslatoZaProizvod: Record<string, boolean> = {};
  poruka = '';

  private sortKolona: SortKolona = 'datumNarudzbine';
  private sortRastuce = false;

  ngOnInit(): void {
    this.ucitaj();
  }

  private ucitaj() {
    const korisnik = this.authService.trenutniKorisnik();
    if (!korisnik) return;

    this.invoiceService.arhivaProizvoda(korisnik._id).subscribe((fakture) => {
      const redovi: RedArhive[] = [];
      for (const f of fakture) {
        for (const s of f.stavke) {
          const red = new RedArhive();
          red.invoiceId = f._id;
          red.proizvodId = s.proizvod;
          red.naziv = s.naziv;
          red.kolicina = s.kolicina;
          red.nazivStamparije = typeof f.stampar === 'object' ? f.stampar.nazivInstitucije : '';
          red.gradStamparije = typeof f.stampar === 'object' ? f.stampar.grad : '';
          red.datumNarudzbine = f.datumNarudzbine;
          red.status = f.status;
          redovi.push(red);
        }
      }
      this.redovi = redovi;
      this.sortiraj(this.sortKolona, true);
      this.ucitajPostojeceRecenzije(korisnik._id);
    });
  }

  private ucitajPostojeceRecenzije(klijentId: string) {
    const primljeniIdi = [
      ...new Set(
        this.redovi.filter((r) => r.status === 'primljeno').map((r) => r.proizvodId)
      ),
    ];
    for (const proizvodId of primljeniIdi) {
      this.recenzijaService.mojaRecenzija(proizvodId, klijentId).subscribe((r) => {
        if (r) {
          this.odabranaReakcija[proizvodId] = r.tipReakcije;
          this.unetTekst[proizvodId] = r.tekst;
          this.poslatoZaProizvod[proizvodId] = true;
        } else {
          this.odabranaReakcija[proizvodId] = 'lajk';
        }
      });
    }
  }

  sortiraj(kolona: SortKolona, zadrziRedosled = false) {
    if (!zadrziRedosled) {
      this.sortRastuce = this.sortKolona === kolona ? !this.sortRastuce : true;
    }
    this.sortKolona = kolona;

    this.redovi = [...this.redovi].sort((a, b) => {
      const va = kolona === 'kolicina' ? a.kolicina : a[kolona];
      const vb = kolona === 'kolicina' ? b.kolicina : b[kolona];
      const rezultat =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), 'sr');
      return this.sortRastuce ? rezultat : -rezultat;
    });
  }

  statusNaziv(status: string): string {
    const nazivi: Record<string, string> = {
      isporuceno: 'Isporučeno',
      primljeno: 'Primljeno',
    };
    return nazivi[status] || status;
  }

  oznaciPrimljeno(red: RedArhive) {
    this.poruka = '';
    this.invoiceService.oznaciPrimljeno(red.invoiceId).subscribe({
      next: () => {
        for (const r of this.redovi) {
          if (r.invoiceId === red.invoiceId) {
            r.status = 'primljeno';
            if (this.odabranaReakcija[r.proizvodId] === undefined) {
              this.odabranaReakcija[r.proizvodId] = 'lajk';
            }
          }
        }
      },
      error: (err) => {
        this.poruka = err?.error?.message || 'Doslo je do greske.';
      },
    });
  }

  posaljiRecenziju(red: RedArhive) {
    const korisnik = this.authService.trenutniKorisnik();
    if (!korisnik) return;
    this.poruka = '';

    const reakcija = this.odabranaReakcija[red.proizvodId] || 'lajk';
    const tekst = this.unetTekst[red.proizvodId] || '';

    this.recenzijaService
      .posalji(red.proizvodId, korisnik._id, korisnik.kor_ime, reakcija, tekst)
      .subscribe({
        next: () => {
          this.poslatoZaProizvod[red.proizvodId] = true;
        },
        error: (err) => {
          this.poruka = err?.error?.message || 'Doslo je do greske prilikom slanja recenzije.';
        },
      });
  }
}
