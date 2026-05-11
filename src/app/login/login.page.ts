import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  public email = '';
  public password = '';
  public loading = false;
  public errorMessage = '';
  public isRegisterMode = false;

  public textos = {
    tituloRegistro: 'Crear una cuenta',
    tituloLogin: 'Iniciar sesión',
    textoRegistro:
      'Introduce tu correo electrónico pararegistrarte en esta aplicación',
    textoLogin: 'Introduce tu correo electrónico y contraseña para acceder',
    textoLabelEmail: 'Correo electrónico',
    textoLabelPassword: 'Contraseña',
    botonContinuar: 'Continuar',
    botonProcesando: 'Procesando...',
    cambiaLogin: '¿Ya tienes cuenta? Inicia sesión',
    cambiaRegistro: '¿No tienes cuenta? Créala aquí',
  };

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        if (user) {
          void this.router.navigateByUrl('/folder/inbox', { replaceUrl: true });
        }
      });
  }

  public async submitEmailForm(): Promise<void> {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const email = this.email.trim();
      const password = this.password.trim();

      if (!email || !password) {
        throw new Error('empty-fields');
      }

      if (this.isRegisterMode) {
        await this.authService.registerWithEmail(email, password);
      } else {
        await this.authService.signInWithEmail(email, password);
      }

      await this.router.navigateByUrl('/folder/inbox', { replaceUrl: true });
    } catch (error) {
      this.errorMessage = this.resolveErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  public async signInWithGoogle(): Promise<void> {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.signInWithGoogle();
      await this.router.navigateByUrl('/folder/inbox', { replaceUrl: true });
    } catch (error) {
      this.errorMessage = this.resolveErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  public toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message === 'empty-fields') {
      return 'Completa el correo y la contraseña.';
    }

    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: string }).code ?? '')
        : '';

    switch (code) {
      case 'auth/invalid-email':
        return 'El correo no es válido.';
      case 'auth/missing-password':
        return 'Escribe una contraseña.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/email-already-in-use':
        return 'Ese correo ya tiene una cuenta. Inicia sesión.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Correo o contraseña incorrectos.';
      default:
        return 'No se pudo iniciar sesión. Intenta de nuevo.';
    }
  }
}
