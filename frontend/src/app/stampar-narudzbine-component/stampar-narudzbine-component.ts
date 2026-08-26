import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { InvoiceService } from '../services/invoice-service';
import { Invoice } from '../models/invoice';

@Component({
  selector: 'app-stampar-narudzbine-component',
  imports: [],
  templateUrl: './stampar-narudzbine-component.html',
  styleUrl: './stampar-narudzbine-component.css',
})
export class StamparNarudzbineComponent implements OnInit {
  private authService = inject(AuthService);
  private invoiceService = inject(InvoiceService);

  fakture: Invoice[] = [];

  ngOnInit(): void {
    const korisnik = this.authService.trenutniKorisnik();
    if (!korisnik) return;
    this.invoiceService.narudzbineStampara(korisnik._id).subscribe((f) => {
      this.fakture = f;
    });
  }

  kupacIme(f: Invoice): string {
    return typeof f.kupac === 'object' ? `${f.kupac.ime} ${f.kupac.prezime}` : '';
  }

  statusNaziv(status: string): string {
    const nazivi: Record<string, string> = {
      naruceno: 'Naručeno',
      u_stampi: 'U štampi',
      isporuceno: 'Isporučeno',
      primljeno: 'Primljeno',
    };
    return nazivi[status] || status;
  }

  pomeriStatus(f: Invoice) {
    this.invoiceService.sledeciStatus(f._id).subscribe((azurirana) => {
      f.status = azurirana.status;
    });
  }
}
