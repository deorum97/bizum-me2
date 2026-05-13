import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { Auth } from '@angular/fire/auth';
import {
  SocialLogin,
  type GoogleLoginOptions,
  type GoogleLoginResponseOnline,
} from '@capgo/capacitor-social-login';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly readySubject = new BehaviorSubject(false);
  private nativeGoogleLoginInitialized = false;

  public readonly user$: Observable<User | null> =
    this.userSubject.asObservable();
  public readonly ready$: Observable<boolean> =
    this.readySubject.asObservable();

  constructor() {
    void setPersistence(this.auth, browserLocalPersistence).catch(
      () => undefined,
    );

    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
      if (!this.readySubject.value) {
        this.readySubject.next(true);
      }
    });
  }

  public async updateDisplayName(name: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('not-authenticated');
    }
    const { updateProfile } = await import('firebase/auth');
    await updateProfile(user, { displayName: name });
    this.userSubject.next(this.auth.currentUser);
  }

  public async updatePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('not-authenticated');
    }

    const isPasswordProvider = (user.providerData || []).some(
      (p) => p.providerId === 'password',
    );

    if (!isPasswordProvider) {
      throw new Error('password-change-not-allowed');
    }

    const { updatePassword } = await import('firebase/auth');
    await updatePassword(user, newPassword);
  }

  public async signInWithGoogle(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      return;
    }

    await this.initializeNativeGoogleLogin();

    const response = await SocialLogin.login({
      provider: 'google',
      options: {
        scopes: ['email', 'profile'],
      } as GoogleLoginOptions,
    });

    if (response.result.responseType !== 'online') {
      throw new Error('google-login-offline-not-supported');
    }

    const googleResponse = response.result as GoogleLoginResponseOnline;
    if (!googleResponse.idToken) {
      throw new Error('google-login-missing-id-token');
    }

    const credential = GoogleAuthProvider.credential(googleResponse.idToken);

    await signInWithCredential(this.auth, credential);
  }

  private async initializeNativeGoogleLogin(): Promise<void> {
    if (this.nativeGoogleLoginInitialized) {
      return;
    }

    await SocialLogin.initialize({
      google: {
        webClientId: environment.firebaseConfig.googleWebClientId,
        mode: 'online',
      },
    });

    this.nativeGoogleLoginInitialized = true;
  }

  public async signInWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  public async registerWithEmail(
    email: string,
    password: string,
  ): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  public async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
