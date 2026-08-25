import { Component, inject } from '@angular/core';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
private userService = inject(UserService)
  private router = inject(Router)

  kor_ime: string = "";
  lozinka: string = "";
  tip: string = "";
  poruka: string = "";

  prijavaNaSistem() {
    this.userService.prijavaNaSistem(this.kor_ime, this.lozinka).subscribe((korisnik) => {
      if (!korisnik) {
        this.poruka = 'Losi podaci';
      }
      else {
        if (korisnik.tip == this.tip) {

          this.poruka = '';
          localStorage.setItem('ulogovan', JSON.stringify(korisnik));
          if (korisnik.tip == "kupac") {
            this.router.navigate(['kupac']);
          }
          else {
            this.router.navigate(['radnik']);
          }
        }
        else {
          this.poruka = 'Pogresan tip korisnika';
        }
      }
    })
  }

}
