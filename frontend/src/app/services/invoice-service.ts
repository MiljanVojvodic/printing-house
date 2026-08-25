import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Invoice } from '../models/invoice';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  uri = 'http://localhost:4000/invoices';

  private http = inject(HttpClient);

  mojeNarudzbine(kupacId: string) {
    return this.http.get<Invoice[]>(`${this.uri}/klijent/${kupacId}`);
  }
}
