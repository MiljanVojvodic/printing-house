import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Korisnik } from '../models/korisnik';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  uri = 'http://localhost:4000/users';

  private http = inject(HttpClient)

  prijavaNaSistem(kor_ime: string, lozinka: string) {
    const data = {
      kor_ime: kor_ime,
      lozinka: lozinka,
    };
    return this.http.post<Korisnik>(`${this.uri}/login`, data);
  }

  dohvatiKorisnika(kor_ime: string) {
    const data = {
      kor_ime: kor_ime,
    };
    return this.http.post<Korisnik>(`${this.uri}/getUser`, data);
  }
}
