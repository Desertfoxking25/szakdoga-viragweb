import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, query, where, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { Observable } from 'rxjs';
import { Product } from '../../shared/models/product.model';
import { map } from 'rxjs/operators';

/**
 * A ProductService a termékek kezeléséért felel a Firestore adatbázisban.
 * Lehetővé teszi a termékek lekérdezését, létrehozását, frissítését és törlését.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {

  /**
   * Konstruktor, amely a Firestore példányt injektálja.
   * @param firestore A Firestore adatbázis példánya
   */
  constructor(private firestore: Firestore) {}

  /**
   * Lekéri az összes terméket a Firestore-ból.
   * @returns Observable, amely a termékek tömbjét tartalmazza
   */
  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products'); // 'products' kollekció referencia
    return collectionData(productsRef, { idField: 'id' }) as Observable<Product[]>;
  }

  /**
   * Lekér egy adott terméket azonosító (id) alapján.
   * @param id A keresett termék dokumentumazonosítója
   * @returns Observable, amely a megtalált terméket tartalmazza
   */
  getProductById(id: string): Observable<Product> {
    const productDoc = doc(this.firestore, `products/${id}`);
    return docData(productDoc, { idField: 'id' }) as Observable<Product>;
  }

  /**
   * Lekér egy terméket a `slug` mező alapján.
   * @param slug A keresett termék egyedi slug-ja (URL-barát név)
   * @returns Observable, amely a slug alapján megtalált terméket (vagy undefined-et) adja vissza
   */
  getProductBySlug(slug: string): Observable<Product | undefined> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, where('slug', '==', slug));

    return collectionData(q, { idField: 'id' }).pipe(
      map(data => data as Product[]),
      map(products => products[0]) // Az első (és elvileg egyetlen) találat visszaadása
    );
  }

  /**
   * Új termék létrehozása az adatbázisban.
   * @param product A létrehozandó termék objektum
   * @returns Promise, amely akkor teljesül, ha a termék sikeresen mentésre került
   */
  createProduct(product: Product): Promise<void> {
    const productsRef = collection(this.firestore, 'products');
    return addDoc(productsRef, product as any).then(() => {}); // Firestore új dokumentum létrehozása
  }

  /**
   * Meglévő termék frissítése részleges adattal.
   * @param id A frissítendő termék Firestore azonosítója
   * @param updatedData A frissítendő mezők (pl. név, ár, kép stb.)
   * @returns Promise, amely a frissítés befejezését jelzi
   */
  updateProduct(id: string, updatedData: Partial<Product>): Promise<void> {
    const productRef = doc(this.firestore, `products/${id}`);
    return updateDoc(productRef, updatedData as any); // Dokumentum frissítése a megadott mezőkkel
  }

  /**
   * Termék törlése az adatbázisból.
   * @param id A törlendő termék dokumentumazonosítója
   * @returns Promise, amely a törlés befejezését jelzi
   */
  deleteProduct(id: string): Promise<void> {
    const productRef = doc(this.firestore, `products/${id}`);
    return deleteDoc(productRef); // Dokumentum törlése
  }

  /**
   * Kép törlése a Firebase Storage-ból, az URL alapján.
   * @param url A törlendő kép publikus letöltési URL-je
   * @returns Promise, amely akkor teljesül, ha a fájl törlése sikeres
   */
  deleteImageByUrl(url: string): Promise<void> {
  const storage = getStorage(); // Firebase Storage példány
  const decodedUrl = decodeURIComponent(url.split('?')[0]); // A token nélküli, kódolatlan útvonal kivonása
  const path = decodedUrl.split('/o/')[1]; // A tényleges fájlútvonal kinyerése (például: 'banan.png')
  const fileRef = ref(storage, path); // Storage referencia a fájlhoz

  return deleteObject(fileRef); // A fájl törlése
}
}
