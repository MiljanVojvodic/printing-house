import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../services/category-service';
import { Kategorija } from '../models/kategorija';

@Component({
  selector: 'app-admin-kategorije-component',
  imports: [FormsModule],
  templateUrl: './admin-kategorije-component.html',
  styleUrl: './admin-kategorije-component.css',
})
export class AdminKategorijeComponent implements OnInit {
  private categoryService = inject(CategoryService);

  kategorije: Kategorija[] = [];
  novaKategorija = '';
  novaPodkategorija: Record<string, string> = {};

  poruka = '';
  uspesnaPoruka = '';

  ngOnInit(): void {
    this.ucitaj();
  }

  private ucitaj() {
    this.categoryService.sveKategorije().subscribe((k) => (this.kategorije = k));
  }

  dodajKategoriju() {
    this.poruka = '';
    this.uspesnaPoruka = '';
    if (!this.novaKategorija.trim()) return;

    this.categoryService.dodajKategoriju(this.novaKategorija.trim()).subscribe({
      next: () => {
        this.uspesnaPoruka = `Kategorija "${this.novaKategorija}" je dodata.`;
        this.novaKategorija = '';
        this.ucitaj();
      },
      error: (err) => {
        this.poruka = err?.error?.message || 'Doslo je do greske.';
      },
    });
  }

  dodajPodkategoriju(kategorija: Kategorija) {
    this.poruka = '';
    this.uspesnaPoruka = '';
    const naziv = (this.novaPodkategorija[kategorija._id] || '').trim();
    if (!naziv) return;

    this.categoryService.dodajPodkategoriju(kategorija._id, naziv).subscribe({
      next: () => {
        this.uspesnaPoruka = `Potkategorija "${naziv}" je dodata u "${kategorija.naziv}".`;
        this.novaPodkategorija[kategorija._id] = '';
        this.ucitaj();
      },
      error: (err) => {
        this.poruka = err?.error?.message || 'Doslo je do greske.';
      },
    });
  }
}
