import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, addDoc, doc, updateDoc, getDocs, deleteDoc, Timestamp } from '@angular/fire/firestore';
import { Rating } from '../models/rating.model';
import { Observable } from 'rxjs';

/**
 * A RatingService kezeli a termékekhez tartozó értékeléseket.
 * Az értékelések a `ratings` kollekcióban tárolódnak, egyedi `userId` és `productId` páros alapján.
 */
@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private ratingsRef;

  /**
   * Konstruktor, amely inicializálja a `ratings` kollekció referenciáját.
   * @param firestore A Firestore adatbázis példánya
   */
  constructor(private firestore: Firestore) {
    this.ratingsRef = collection(this.firestore, 'ratings');
  }

  /**
   * Lekéri az adott termékhez tartozó összes értékelést.
   * @param productId A termék azonosítója
   * @returns Observable, amely a termékhez tartozó értékelések tömbjét adja vissza
   */
  getRatingsByProduct(productId: string): Observable<Rating[]> {
    const q = query(this.ratingsRef, where('productId', '==', productId)); // Termék alapján szűrés
    return collectionData(q, { idField: 'id' }) as unknown as Observable<Rating[]>; // Observable visszatérés
  }

  /**
   * Lekéri egy felhasználó adott termékhez tartozó értékelését.
   * @param userId A felhasználó azonosítója
   * @param productId A termék azonosítója
   * @returns Promise, amely az értékelést (Rating) vagy null-t ad vissza, ha nincs találat
   */
  async getUserRatingForProduct(userId: string, productId: string): Promise<Rating | null> {
    const q = query(this.ratingsRef,
      where('productId', '==', productId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    // Első találat visszaadása Rating objektumként
    return {
      id: snapshot.docs[0].id,
      ...(snapshot.docs[0].data() as Rating)
    };
  }

  /**
   * Hozzáad vagy frissít egy értékelést adott userId és productId alapján.
   * Ha már van értékelés, akkor frissíti; ha nincs, akkor újat hoz létre.
   * @param rating Az értékelés objektum (csillag + szöveg)
   * @returns Promise, amely a művelet befejezését jelzi
   */
  async addOrUpdateRating(rating: Rating): Promise<void> {
    const existing = await this.getUserRatingForProduct(rating.userId, rating.productId);

    if (existing) {
      const ratingDoc = doc(this.firestore, 'ratings', existing.id!);
      await updateDoc(ratingDoc, {
        stars: rating.stars,
        reviewText: rating.reviewText,
        createdAt: Timestamp.now() // Értékelés frissítve
      });
    } else {
      await addDoc(this.ratingsRef, {
        ...rating,
        createdAt: Timestamp.now() // Új értékelés beszúrása
      });
    }
  }

  /**
   * Törli egy felhasználó adott termékhez tartozó értékelését.
   * @param userId A felhasználó azonosítója
   * @param productId A termék azonosítója
   * @returns Promise, amely a törlés befejezését jelzi
   */
  async deleteRating(userId: string, productId: string): Promise<void> {
    const q = query(this.ratingsRef,
      where('userId', '==', userId),
      where('productId', '==', productId)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await deleteDoc(docRef); // Dokumentum törlése, ha megtaláltuk
    }
  }
}
