import { Routes } from '@angular/router';
import { LoginComponent } from './login-component/login-component';
import { KupacComponent } from './kupac-component/kupac-component';
import { RadnikComponent } from './radnik-component/radnik-component';

export const routes: Routes = [
    {path: "", component: LoginComponent},
    {path: "kupac", component: KupacComponent},
    {path: "radnik", component: RadnikComponent}
];
