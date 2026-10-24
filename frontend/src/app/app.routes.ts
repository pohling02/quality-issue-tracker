import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { IssuesComponent } from './pages/issues/issues.component';
import { IssueFormComponent } from './pages/issue-form/issue-form.component';
import { authGuard } from './core/guards/auth.guard';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'issues', component: IssuesComponent, canActivate: [authGuard] },
  { path: 'issues/new', component: IssueFormComponent, canActivate: [authGuard] },
  { path: 'issues/:id/edit', component: IssueFormComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'issues', pathMatch: 'full' },
  { path: '**', redirectTo: 'issues' },
];