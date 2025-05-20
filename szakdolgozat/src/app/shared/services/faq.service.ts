import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { Faq } from '../models/faq.model';
import { Observable } from 'rxjs';

/**
 * A FaqService a Firestore adatbázisban tárolt GYIK (Gyakran Ismételt Kérdések) bejegyzések kezeléséért felel.
 * Lehetővé teszi a kérdések lekérdezését, hozzáadását és törlését.
 */
@Injectable({
  providedIn: 'root'
})
export class FaqService {

  /**
   * Konstruktor, amely injectálja a Firestore adatbázist.
   * @param firestore Az aktuális Firestore példány
   */
  constructor(private firestore: Firestore) {}

  /**
   * Lekéri az összes GYIK bejegyzést valós idejű frissítéssel.
   * @returns Observable, amely tartalmazza a GYIK elemek listáját
   */
  getFaqs(): Observable<Faq[]> {
    const faqRef = collection(this.firestore, 'faqs'); // 'faqs' kollekció referencia
    return collectionData(faqRef, { idField: 'id' }) as Observable<Faq[]>; // ID mezőt is visszaadja
  }

  /**
   * Új GYIK bejegyzés hozzáadása az adatbázishoz.
   * @param faq A hozzáadandó Faq objektum
   * @returns Promise, amely akkor teljesül, amikor a bejegyzés hozzáadásra került
   */
  addFaq(faq: Faq): Promise<void> {
    const faqRef = collection(this.firestore, 'faqs'); // GYIK kollekció referencia
    return addDoc(faqRef, faq).then(() => {}); // Új dokumentum beszúrása, üres then a void típushoz
  }

  /**
   * Meglévő GYIK bejegyzés törlése azonosító alapján.
   * @param id A törlendő bejegyzés Firestore dokumentum-azonosítója
   * @returns Promise, amely akkor teljesül, amikor a bejegyzés törlésre került
   */
  deleteFaq(id: string): Promise<void> {
    const faqDoc = doc(this.firestore, 'faqs', id); // Dokumentum referencia az ID alapján
    return deleteDoc(faqDoc); // Dokumentum törlése
  }
}
