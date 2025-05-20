import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, where, Timestamp, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Order } from '../models/order.model';
import { Observable } from 'rxjs';

/**
 * OrderService a felhasználói rendelések Firestore-alapú kezelésére szolgál.
 * A rendelések a `orders` kollekcióban kerülnek tárolásra.
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {

  /**
   * Konstruktor, amely injectálja a Firestore példányt.
   * @param firestore A Firestore adatbázis példánya
   */
  constructor(private firestore: Firestore) {}

  /**
   * Lekéri az összes rendelést valós idejű frissítéssel.
   * @returns Observable, amely tartalmazza az összes rendelést
   */
  getAllOrders(): Observable<Order[]> {
    const ordersRef = collection(this.firestore, 'orders'); // 'orders' kollekció referencia
    return collectionData(ordersRef, { idField: 'id' }) as Observable<Order[]>;
  }

  /**
   * Lekéri egy adott felhasználó rendeléseit a userId alapján.
   * @param userId A felhasználó azonosítója (Firebase UID)
   * @returns Observable, amely a felhasználó rendeléseit tartalmazza
   */
  getOrdersByUser(userId: string): Observable<Order[]> {
    const ordersRef = collection(this.firestore, 'orders');
    const q = query(ordersRef, where('userId', '==', userId)); // Csak a megadott userId alapján szűrve
    return collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }

  /**
   * Új rendelés hozzáadása az adatbázishoz.
   * Automatikusan beállítja a `createdAt` és `status` mezőket is.
   * @param order A létrehozandó rendelés objektum
   * @returns Promise, amely akkor teljesül, amikor a rendelés elmentésre kerül
   */
  addOrder(order: Order): Promise<void> {
    const ordersRef = collection(this.firestore, 'orders');
    return addDoc(ordersRef, {
      ...order,
      createdAt: Timestamp.now(), // Rögzítjük a létrehozás időpontját
      status: 'új' // Alapértelmezett státusz
    }).then(() => {});
  }

  /**
   * Meglévő rendelés frissítése megadott adatokkal.
   * @param id A rendelés Firestore azonosítója
   * @param data A frissítendő mezők (részleges Order objektum)
   * @returns Promise, amely a frissítés után teljesül
   */
  updateOrder(id: string, data: Partial<Order>): Promise<void> {
    const orderDoc = doc(this.firestore, 'orders', id); // Dokumentum referencia ID alapján
    return updateDoc(orderDoc, data as any); // Frissítjük a megadott mezőket
  }

  /**
   * Rendelés törlése Firestore-ból.
   * @param id A törlendő rendelés Firestore dokumentum-azonosítója
   * @returns Promise, amely akkor teljesül, amikor a rendelés törlésre kerül
   */
  deleteOrder(id: string): Promise<void> {
    const orderDoc = doc(this.firestore, 'orders', id);
    return deleteDoc(orderDoc);
  }
}
