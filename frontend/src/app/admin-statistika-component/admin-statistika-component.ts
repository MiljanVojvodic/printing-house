import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import {
  NajcesciProizvod,
  OcenaProizvoda,
  PrometStamparije,
  StatistikaService,
} from '../services/statistika-service';

Chart.register(...registerables);

const BOJE = [
  '#2563eb',
  '#f59e0b',
  '#16a34a',
  '#dc2626',
  '#9333ea',
  '#0e7490',
  '#be185d',
  '#65a30d',
];

@Component({
  selector: 'app-admin-statistika-component',
  imports: [],
  templateUrl: './admin-statistika-component.html',
  styleUrl: './admin-statistika-component.css',
})
export class AdminStatistikaComponent implements AfterViewInit, OnDestroy {
  private statistikaService = inject(StatistikaService);
  private ngZone = inject(NgZone);

  @ViewChild('barCanvas') barCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas') pieCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvasRef!: ElementRef<HTMLCanvasElement>;

  private prometBar: Chart | null = null;
  private proizvodiPie: Chart | null = null;
  private ocenaLine: Chart | null = null;

  greska = '';

  ngAfterViewInit(): void {
    // Canvas elementi su uvek u DOM-u (nisu iza @if-a kao Leaflet mapa u
    // Stavci 4), pa su spremni odmah - podaci sa servera stizu asinhrono,
    // tek u subscribe() ispod, pa se svaki grafikon crta tek tada.
    this.statistikaService.prometPoStampariji().subscribe({
      next: (podaci) => this.iscrtajBar(podaci),
      error: () => (this.greska = 'Doslo je do greske prilikom ucitavanja statistike.'),
    });
    this.statistikaService.najcesciProizvodi().subscribe({
      next: (podaci) => this.iscrtajPitu(podaci),
      error: () => (this.greska = 'Doslo je do greske prilikom ucitavanja statistike.'),
    });
    this.statistikaService.ocenaKrozVreme().subscribe({
      next: (podaci) => this.iscrtajLiniju(podaci),
      error: () => (this.greska = 'Doslo je do greske prilikom ucitavanja statistike.'),
    });
  }

  private iscrtajBar(podaci: PrometStamparije[]) {
    this.ngZone.runOutsideAngular(() => {
      this.prometBar = new Chart(this.barCanvasRef.nativeElement, {
        type: 'bar',
        data: {
          labels: podaci.map((p) => p.naziv),
          datasets: [
            {
              label: 'Promet (RSD, poslednja 3 meseca)',
              data: podaci.map((p) => p.ukupanPromet),
              backgroundColor: BOJE[0],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } },
        },
      });
    });
  }

  private iscrtajPitu(podaci: NajcesciProizvod[]) {
    this.ngZone.runOutsideAngular(() => {
      this.proizvodiPie = new Chart(this.pieCanvasRef.nativeElement, {
        type: 'pie',
        data: {
          labels: podaci.map((p) => p.naziv),
          datasets: [
            {
              label: 'Naruceno (poslednjih mesec dana)',
              data: podaci.map((p) => p.kolicina),
              backgroundColor: podaci.map((_, i) => BOJE[i % BOJE.length]),
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    });
  }

  private iscrtajLiniju(podaci: OcenaProizvoda[]) {
    // Koristi se 'linear' x-osa sa vremenskim oznakama u milisekundama (ne
    // Chart.js-ov 'time' tip skale, jer bi taj zahtevao dodatnu biblioteku
    // za parsiranje datuma - adapter). Prikaz datuma na osi se dobija
    // formatiranjem preko "ticks.callback", bez ikakve dodatne zavisnosti.
    // Klik na stavku u legendi vec podrazumevano sakriva/prikazuje tu
    // liniju - to je ugradjeno ponasanje Chart.js-a, ne treba dodatni kod.
    this.ngZone.runOutsideAngular(() => {
      this.ocenaLine = new Chart(this.lineCanvasRef.nativeElement, {
        type: 'line',
        data: {
          datasets: podaci.map((p, i) => ({
            label: p.naziv,
            data: p.tacke.map((t) => ({ x: new Date(t.datum).getTime(), y: t.ocena })),
            borderColor: BOJE[i % BOJE.length],
            backgroundColor: BOJE[i % BOJE.length],
            fill: false,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              ticks: {
                callback: (vrednost) => new Date(Number(vrednost)).toLocaleDateString('sr-RS'),
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: (stavke) =>
                  stavke.length > 0
                    ? new Date(Number(stavke[0].parsed.x)).toLocaleDateString('sr-RS')
                    : '',
              },
            },
          },
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.prometBar?.destroy();
    this.proizvodiPie?.destroy();
    this.ocenaLine?.destroy();
  }
}
