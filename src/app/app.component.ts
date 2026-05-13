import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  public readonly user$ = this.authService.user$;
  public readonly userEmail$ = this.user$.pipe(
    map((user) => user?.email || 'Cuenta autenticada'),
  );

  public async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
