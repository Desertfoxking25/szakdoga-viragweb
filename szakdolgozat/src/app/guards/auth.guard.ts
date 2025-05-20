import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { Auth } from '@angular/fire/auth';

/**
 * Route guard, amely megakadályozza az illetéktelen hozzáférést.
 * Támogatja az egyszerű bejelentkezés-ellenőrzést és opcionálisan admin jogosultságot is.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  /**
   * Konstruktor: Auth, Router és Firestore injectálása.
   * @param auth Firebase Auth példány (bejelentkezett felhasználóhoz)
   * @param router Angular Router a navigáláshoz
   * @param firestore Firestore adatbázis a jogosultság lekérdezéséhez
   */
  constructor(
    private auth: Auth,
    private router: Router,
    private firestore: Firestore
  ) {}

  /**
   * Meghatározza, hogy a felhasználó aktiválhatja-e az adott route-ot.
   * Ha a route `data.requiresAdmin` = true, admin jog ellenőrzés is történik.
   * @param route Az aktiválni kívánt route pillanatképe
   * @returns Promise<boolean> — `true`, ha jogosult, `false` ha nem
   */
  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const user = this.auth.currentUser;

    // Ha nincs bejelentkezett felhasználó → irány a login oldal
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    // Ha a route admin jogot igényel
    const requiresAdmin = route.data?.['requiresAdmin'] === true;
    if (requiresAdmin) {
      return this.checkAdminAccess(user.uid);
    }

    // Be van jelentkezve és nincs szükség admin jogra
    return true;
  }

  /**
   * Ellenőrzi, hogy a felhasználó rendelkezik-e admin jogosultsággal a Firestore alapján.
   * @param uid A felhasználó Firebase UID-ja
   * @returns Promise<boolean> — `true`, ha admin, egyébként `false` és visszairányítás
   */
  async checkAdminAccess(uid: string): Promise<boolean> {
    try {
      const userDoc = doc(this.firestore, `users/${uid}`);
      const userData: any = await firstValueFrom(docData(userDoc));

      if (userData?.admin === true) {
        return true;
      } else {
        alert('Nincs jogosultságod az admin felülethez.');
        this.router.navigate(['/']);
        return false;
      }
    } catch (err) {
      console.error('Hiba a jogosultság ellenőrzésénél:', err);
      this.router.navigate(['/']);
      return false;
    }
  }
}
