import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Korisnik } from '../models/korisnik';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  uri = 'http://localhost:4000/users';

  private http = inject(HttpClient);

  prijavaNaSistem(kor_ime: string, lozinka: string) {
    const data = { kor_ime, lozinka };
    return this.http.post<Korisnik>(`${this.uri}/login`, data);
  }

  adminPrijava(kor_ime: string, lozinka: string) {
    const data = { kor_ime, lozinka };
    return this.http.post<Korisnik>(`${this.uri}/admin-login`, data);
  }

  registruj(podaci: FormData) {
    return this.http.post<{ message: string }>(`${this.uri}/register`, podaci);
  }

  dohvatiKorisnika(kor_ime: string) {
    const data = { kor_ime };
    return this.http.post<Korisnik>(`${this.uri}/getUser`, data);
  }
}
