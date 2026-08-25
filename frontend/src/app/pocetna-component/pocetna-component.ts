import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Prava pocetna strana (broj stamparija, TOP 5 proizvoda, pretraga) dolazi u Fazi 2.
@Component({
  selector: 'app-pocetna-component',
  imports: [RouterLink],
  templateUrl: './pocetna-component.html',
  styleUrl: './pocetna-component.css',
})
export class PocetnaComponent {}
