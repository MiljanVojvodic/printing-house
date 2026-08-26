import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../services/auth-service';
import { JavnaNabavkaService } from '../services/javna-nabavka-service';
import { JavnaNabavka } from '../models/javna-nabavka';

@Component({
  selector: 'app-javne-nabavke-component',
  imports: [DatePipe],
  templateUrl: './javne-nabavke-component.html',
  styleUrl: './javne-nabavke-component.css',
})
export class JavneNabavkeComponent implements OnInit {
  private authService = inject(AuthService);
  private javnaNabavkaService = inject(JavnaNabavkaService);

  nabavke: JavnaNabavka[] = [];

  ngOnInit(): void {
    const korisnik = this.authService.trenutniKorisnik();
    if (!korisnik) return;
    this.javnaNabavkaService.mojeNabavke(korisnik._id).subscribe((n) => {
      this.nabavke = n;
    });
  }

  nazivPobednika(n: JavnaNabavka): string {
    return typeof n.pobednik === 'object' && n.pobednik ? n.pobednik.nazivInstitucije : '';
  }
}
