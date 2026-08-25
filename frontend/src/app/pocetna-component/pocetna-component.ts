import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../services/user-service';
import { ProductService } from '../services/product-service';
import { Proizvod } from '../models/proizvod';
import { PretragaComponent } from '../pretraga-component/pretraga-component';

@Component({
  selector: 'app-pocetna-component',
  imports: [RouterLink, PretragaComponent],
  templateUrl: './pocetna-component.html',
  styleUrl: './pocetna-component.css',
})
export class PocetnaComponent implements OnInit {
  private userService = inject(UserService);
  private productService = inject(ProductService);

  brojStamparija = 0;
  top5: Proizvod[] = [];

  ngOnInit(): void {
    this.userService.brojStamparija().subscribe((r) => {
      this.brojStamparija = r.broj;
    });
    this.productService.top5().subscribe((p) => {
      this.top5 = p;
    });
  }
}
