import { Routes } from '@angular/router';
import { PocetnaComponent } from './pocetna-component/pocetna-component';
import { LoginComponent } from './login-component/login-component';
import { AdminLoginComponent } from './admin-login-component/admin-login-component';
import { RegistracijaComponent } from './registracija-component/registracija-component';
import { KlijentProfilComponent } from './klijent-profil-component/klijent-profil-component';
import { StamparProfilComponent } from './stampar-profil-component/stampar-profil-component';
import { AdminZahteviComponent } from './admin-zahtevi-component/admin-zahtevi-component';
import { PretragaComponent } from './pretraga-component/pretraga-component';
import { ProizvodDetaljiComponent } from './proizvod-detalji-component/proizvod-detalji-component';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: '', component: PocetnaComponent },
  { path: 'prijava', component: LoginComponent },
  { path: 'registracija', component: RegistracijaComponent },
  { path: 'administracija/prijava', component: AdminLoginComponent },
  { path: 'proizvodi', component: PretragaComponent },
  { path: 'proizvodi/:id', component: ProizvodDetaljiComponent },
  {
    path: 'klijent/profil',
    component: KlijentProfilComponent,
    canActivate: [roleGuard('fizicko', 'pravno')],
  },
  {
    path: 'stampar/profil',
    component: StamparProfilComponent,
    canActivate: [roleGuard('stampar')],
  },
  {
    path: 'admin/zahtevi',
    component: AdminZahteviComponent,
    canActivate: [roleGuard('admin')],
  },
];
