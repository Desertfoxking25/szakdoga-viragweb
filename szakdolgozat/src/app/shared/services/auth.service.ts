import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

/**
 * AuthService szolgáltatás kezeli a hitelesítési műveleteket.
 * Ez magában foglalja a regisztrációt, bejelentkezést és kijelentkezést Firebase Authentication segítségével.
 */
@Injectable({
  providedIn: 'root' // Globálisan elérhető szolgáltatás
})
export class AuthService {

  /**
   * Konstruktor, amely injectálja az AngularFireAuth példányt.
   * @param afAuth Az AngularFireAuth szolgáltatás példánya
   */
  constructor(private afAuth: AngularFireAuth) {}

  /**
   * Új felhasználó regisztrálása e-mail és jelszó alapján.
   * @param email A felhasználó e-mail címe
   * @param password A felhasználó jelszava
   * @returns Promise, amely a Firebase hitelesítési válaszát tartalmazza
   */
  register(email: string, password: string) {
    // Létrehoz egy új felhasználót a megadott email és jelszó alapján
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  /**
   * Felhasználó bejelentkezése e-mail és jelszó segítségével.
   * @param email A felhasználó e-mail címe
   * @param password A felhasználó jelszava
   * @returns Promise, amely a bejelentkezés eredményét adja vissza
   */
  login(email: string, password: string) {
    // Bejelentkezik a megadott email és jelszó kombinációval
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  /**
   * Aktuális felhasználó kijelentkeztetése a rendszerből.
   * @returns Promise, amely jelez, ha a kijelentkezés befejeződött
   */
  logout() {
    // Kijelentkezteti az aktuális felhasználót
    return this.afAuth.signOut();
  }
}
