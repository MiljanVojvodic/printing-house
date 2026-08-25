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
import { ProizvodPripremaComponent } from './proizvod-priprema-component/proizvod-priprema-component';
import { KorpaComponent } from './korpa-component/korpa-component';
import { StamparProizvodiComponent } from './stampar-proizvodi-component/stampar-proizvodi-component';
import { StamparKolicineComponent } from './stampar-kolicine-component/stampar-kolicine-component';
import { StamparNarudzbineComponent } from './stampar-narudzbine-component/stampar-narudzbine-component';
import { AdminNaloziComponent } from './admin-nalozi-component/admin-nalozi-component';
import { AdminKategorijeComponent } from './admin-kategorije-component/admin-kategorije-component';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: '', component: PocetnaComponent },
  { path: 'prijava', component: LoginComponent },
  { path: 'registracija', component: RegistracijaComponent },
  { path: 'administracija/prijava', component: AdminLoginComponent },
  { path: 'proizvodi', component: PretragaComponent },
  { path: 'proizvodi/:id', component: ProizvodDetaljiComponent },
  {
    path: 'proizvodi/:id/priprema',
    component: ProizvodPripremaComponent,
    canActivate: [roleGuard('fizicko', 'pravno')],
  },
  {
    path: 'korpa',
    component: KorpaComponent,
    canActivate: [roleGuard('fizicko', 'pravno')],
  },
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
    path: 'stampar/proizvodi',
    component: StamparProizvodiComponent,
    canActivate: [roleGuard('stampar')],
  },
  {
    path: 'stampar/kolicine',
    component: StamparKolicineComponent,
    canActivate: [roleGuard('stampar')],
  },
  {
    path: 'stampar/narudzbine',
    component: StamparNarudzbineComponent,
    canActivate: [roleGuard('stampar')],
  },
  {
    path: 'admin/zahtevi',
    component: AdminZahteviComponent,
    canActivate: [roleGuard('admin')],
  },
  {
    path: 'admin/nalozi',
    component: AdminNaloziComponent,
    canActivate: [roleGuard('admin')],
  },
  {
    path: 'admin/kategorije',
    component: AdminKategorijeComponent,
    canActivate: [roleGuard('admin')],
  },
];
