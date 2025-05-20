import { NgModule, LOCALE_ID } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { CommonModule, registerLocaleData } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from "@angular/fire/firestore";

import { environment } from "../environments/environment";
import { AppRoutingModule } from "./app.routing.module";
import { AppComponent } from "./app.component";
import { MenuComponent } from "./shared/menu/menu.component";
import { MatSnackBarModule } from '@angular/material/snack-bar';

import localeHu from '@angular/common/locales/hu';

/**
 * Az alkalmazás fő modulja, amely konfigurálja a szükséges Angular és Firebase modulokat,
 * valamint beállítja a magyar lokalizációt.
 */
@NgModule({
  declarations: [
    AppComponent,     // Gyökér komponens
    MenuComponent     // Navigációs menü komponens
  ],
  imports: [
    BrowserModule,               // Szükséges a böngészős alkalmazásokhoz
    AppRoutingModule,            // Alkalmazás útvonalai
    FormsModule,                 // Template-driven formák támogatása
    AngularFireModule.initializeApp(environment.firebase), // Firebase inicializálás
    AngularFireAuthModule,       // Firebase Auth támogatás
    CommonModule,                // Alap Angular direktívák (ngIf, ngFor, stb.)
    RouterModule,                // Útvonalkezelés
    MatSnackBarModule,           // Material Snackbar üzenetek
    BrowserAnimationsModule      // Animációs támogatás (Materialnak is szüksége van rá)
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Modern Firebase inicializálás
    provideAuth(() => getAuth()),                                  // Firebase Auth szolgáltatás
    provideFirestore(() => getFirestore()),                        // Firestore szolgáltatás
    { provide: LOCALE_ID, useValue: 'hu-HU' }                      // Magyar lokalizáció beállítása
  ],
  bootstrap: [AppComponent] // A gyökér komponens, amely az alkalmazást elindítja
})
export class AppModule {}

// Magyar nyelvi adatok regisztrálása (pl. dátumformátum, pénznem stb.)
registerLocaleData(localeHu);
