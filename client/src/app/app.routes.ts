import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AddSignalComponent } from './pages/add-signal/add-signal.component';
import { SignalsListComponent } from './pages/signals-list/signals-list.component';


export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'add-signals',
    component: AddSignalComponent
  }, 
  {
    path: 'signals',
    component: SignalsListComponent
  }
];
