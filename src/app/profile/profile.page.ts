import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ProfilePage implements OnInit, OnDestroy {
  public displayName = '';
  public email = '';
  public newPassword = '';
  public confirmPassword = '';
  public canChangePassword = false;

  private sub?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.sub = this.authService.user$.subscribe((user) => {
      if (user) {
        this.displayName = user.displayName || '';
        this.email = user.email || '';
        this.canChangePassword = (user.providerData || []).some(
          (p: any) => p.providerId === 'password',
        );
      } else {
        this.displayName = '';
        this.email = '';
        this.canChangePassword = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  public async saveName(): Promise<void> {
    try {
      await this.authService.updateDisplayName(this.displayName);
      alert('Nombre actualizado');
    } catch (e: any) {
      alert(e?.message || String(e));
    }
  }

  public async changePassword(): Promise<void> {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    try {
      await this.authService.updatePassword(this.newPassword);
      alert('Contraseña cambiada');
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (e: any) {
      alert(e?.message || String(e));
    }
  }
}
