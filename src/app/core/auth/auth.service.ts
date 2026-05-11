import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly readySubject = new BehaviorSubject(false);

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

  public async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
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
