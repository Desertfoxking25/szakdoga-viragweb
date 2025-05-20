import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CartItem } from '../models/CartItem.model';

/**
 * A CartService a felhasználók kosarát kezeli a Firestore adatbázisban.
 * Minden kosár a `carts` kollekcióban egyedi `userId` dokumentumként tárolódik.
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {

  /**
   * Konstruktor, amely a Firestore-t és Auth-ot injektálja.
   * @param firestore Firestore adatbázis referencia
   * @param auth Firebase Auth referencia (jelenleg nem használt közvetlenül)
   */
  constructor(private firestore: Firestore, private auth: Auth) {}

  /**
   * Lekéri egy felhasználó kosarának tartalmát.
   * @param userId A felhasználó azonosítója (Firebase UID)
   * @returns A kosárban található CartItem-ek tömbje (üres tömb, ha nem létezik)
   */
  async getCart(userId: string): Promise<CartItem[]> {
    const ref = doc(this.firestore, 'carts', userId); // Kosár dokumentum referencia
    const snap = await getDoc(ref); // Dokumentum lekérése
    if (snap.exists()) {
      return snap.data()['items'] || []; // Visszaadja az 'items' tömböt, vagy üres tömböt
    } else {
      return [];
    }
  }

  /**
   * Termék hozzáadása a kosárhoz. Ha már szerepel, növeli a mennyiséget.
   * @param userId A felhasználó azonosítója
   * @param item A hozzáadandó CartItem objektum
   */
  async addToCart(userId: string, item: CartItem): Promise<void> {
    const ref = doc(this.firestore, 'carts', userId);
    const snap = await getDoc(ref);
    let items: CartItem[] = [];

    if (snap.exists()) {
      items = snap.data()['items'] || [];

      // Ellenőrizzük, hogy az adott termék már a kosárban van-e
      const index = items.findIndex(i => i.productId === item.productId);
      if (index !== -1) {
        items[index].quantity += item.quantity; // Már benne van → mennyiség növelése
      } else {
        items.push(item); // Új termék → hozzáadás
      }
    } else {
      items = [item]; // Nincs még kosár → új tömb létrehozása
    }

    await setDoc(ref, { items }); // Kosár frissítése/adatbázisba mentés
  }

  /**
   * Termék eltávolítása a kosárból.
   * @param userId A felhasználó azonosítója
   * @param productId A törlendő termék azonosítója
   */
  async removeFromCart(userId: string, productId: string): Promise<void> {
    const ref = doc(this.firestore, 'carts', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    let items: CartItem[] = snap.data()['items'] || [];

    // Eltávolítja a megadott terméket
    items = items.filter(i => i.productId !== productId);

    await updateDoc(ref, { items }); // Kosár frissítése
  }

  /**
   * Egy adott termék mennyiségének beállítása a kosárban.
   * @param userId A felhasználó azonosítója
   * @param item A termék, aminek a mennyiségét frissíteni kell
   */
  async setQuantity(userId: string, item: CartItem): Promise<void> {
    const ref = doc(this.firestore, 'carts', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    let items: CartItem[] = snap.data()['items'] || [];

    // Megkeressük a megfelelő terméket
    const index = items.findIndex(i => i.productId === item.productId);
    if (index !== -1) {
      items[index].quantity = item.quantity; // Mennyiség frissítése
      await setDoc(ref, { items });
    }
  }

  /**
   * A teljes kosár kiürítése.
   * @param userId A felhasználó azonosítója
   */
  async clearCart(userId: string): Promise<void> {
    const ref = doc(this.firestore, 'carts', userId);
    await setDoc(ref, { items: [] }); // Üres tömb beállítása → kosár törlése
  }
}
