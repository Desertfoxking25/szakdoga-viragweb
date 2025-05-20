import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, query, orderBy, Timestamp, DocumentReference } from '@angular/fire/firestore';
import { Tip } from '../models/tip.model';
import { Observable } from 'rxjs';

/**
 * A TipService a Firestore-ban tárolt tippek (pl. kertészeti tanácsok) kezelését végzi.
 * Lehetőség van tippek lekérdezésére, hozzáadására és törlésére.
 */
@Injectable({
  providedIn: 'root'
})
export class TipService {

  /**
   * Konstruktor, amely inicializálja a Firestore példányt.
   * @param firestore A Firestore adatbázis példánya
   */
  constructor(private firestore: Firestore) {}

  /**
   * Visszaadja az összes tippet, időrend szerint visszafelé rendezve (legfrissebb elöl).
   * @returns Observable, amely a tippek tömbjét tartalmazza
   */
  getTips(): Observable<Tip[]> {
    const tipRef = query(
      collection(this.firestore, 'tips'),
      orderBy('createdAt', 'desc') // Legfrissebb tippek elöl
    );
    return collectionData(tipRef, { idField: 'id' }) as Observable<Tip[]>;
  }

  /**
   * Új tipp hozzáadása az adatbázishoz.
   * Automatikusan beállítja a létrehozás időbélyegét.
   * @param tip A hozzáadandó Tip objektum
   * @returns Promise, amely tartalmazza az új dokumentum Firestore referenciáját
   */
  addTip(tip: Tip): Promise<DocumentReference> {
    const tipRef = collection(this.firestore, 'tips');
    return addDoc(tipRef, {
      ...tip,
      createdAt: Timestamp.now() // Aktuális időbélyeg hozzáadása
    });
  }

  /**
   * Tipp törlése azonosító alapján.
   * @param id A törlendő tipp Firestore dokumentumazonosítója
   * @returns Promise, amely akkor teljesül, amikor a törlés megtörtént
   */
  deleteTip(id: string): Promise<void> {
    const tipDoc = doc(this.firestore, 'tips', id);
    return deleteDoc(tipDoc);
  }
}
