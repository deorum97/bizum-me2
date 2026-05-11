import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'bizumme-52a11',
        appId: '1:255288621040:web:34b7eff912592965d7cf35',
        storageBucket: 'bizumme-52a11.firebasestorage.app',
        apiKey: 'AIzaSyDr8oKJ3ZO_CFVsOVti4Me4NV4ozLIsnY8',
        authDomain: 'bizumme-52a11.firebaseapp.com',
        messagingSenderId: '255288621040',
        measurementId: 'G-XBEDWQTZEZ',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
