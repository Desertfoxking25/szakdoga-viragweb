import { Injectable } from '@angular/core';
import { Firestore, doc, docData, setDoc, getDoc } from '@angular/fire/firestore';
import { UserProfile } from '../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

/**
 * A UserService kezeli a felhasználók profilját és admin jogosultságait.
 * Figyeli az auth állapotot, és automatikusan betölti az admin státuszt a Firestore-ból.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private adminSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observable, amely követhető admin státuszt szolgáltat.
   */
  admin$: Observable<boolean> = this.adminSubject.asObservable();  

  /**
   * Konstruktor: auth állapot változásra figyel, és frissíti az admin állapotot.
   * @param firestore Firestore adatbázis példánya
   * @param auth Firebase Auth példány (felhasználói bejelentkezés figyelése)
   */
  constructor(private firestore: Firestore, private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const userRef = doc(this.firestore, 'users', user.uid);
        docData(userRef).subscribe((data: any) => {
          this.adminSubject.next(data?.admin === true); // Beállítja az admin státuszt
        });
      } else {
        this.adminSubject.next(false); // Kijelentkezéskor admin = false
      }
    });
  }

  /**
   * Manuálisan beállítja az admin státuszt.
   * (pl. teszteléshez vagy override-hoz)
   * @param value Az admin állapot logikai értéke
   */
  setIsAdmin(value: boolean) {
    this.adminSubject.next(value);
  }

  /**
   * Visszaadja az aktuális admin státuszt szinkron módon.
   * @returns `true` ha admin, különben `false`
   */
  getIsAdmin(): boolean {
    return this.adminSubject.value;
  }

  /**
   * Felhasználói Firestore dokumentum lekérése ID alapján (nyers adatként).
   * @param uid A felhasználó Firebase UID-ja
   * @returns Observable, amely tartalmazza a felhasználói dokumentumot
   */
  getUserById(uid: string): Observable<any> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    return docData(userDoc);
  }

  /**
   * Felhasználói profil lekérése típusosan (UserProfile-ként).
   * @param uid A felhasználó Firebase UID-ja
   * @returns Observable, amely a felhasználói profilt tartalmazza
   */
  getUserProfile(uid: string): Observable<UserProfile> {
    const userRef = doc(this.firestore, 'users', uid);
    return docData(userRef) as Observable<UserProfile>;
  }

  /**
   * Felhasználói profil frissítése. A meglévő mezőket megtartja (merge: true).
   * @param profile A frissítendő felhasználói profil
   * @returns Promise, amely a frissítés befejezését jelzi
   */
  async updateUserProfile(profile: UserProfile): Promise<void> {
    const userRef = doc(this.firestore, 'users', profile.uid);
    await setDoc(userRef, profile, { merge: true }); // Csak a változó mezőket írja felül
  }

  /**
   * Profil létrehozása, ha még nem létezik az adott felhasználónak.
   * @param profile Az új felhasználói profil adatai
   * @returns Promise, amely akkor teljesül, ha a profil létrejött (vagy már létezett)
   */
  async createUserProfileIfMissing(profile: UserProfile): Promise<void> {
    const userRef = doc(this.firestore, 'users', profile.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, profile); // Csak akkor hozza létre, ha még nem létezett
    }
  }
}
