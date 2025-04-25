import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, query, where, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../../shared/models/product.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  constructor(private firestore: Firestore) {}

  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    return collectionData(productsRef, { idField: 'id' }) as Observable<Product[]>;
  }
  
  getProductById(id: string): Observable<Product> {
    const productDoc = doc(this.firestore, `products/${id}`);
    return docData(productDoc, { idField: 'id' }) as Observable<Product>;
  }

  getProductBySlug(slug: string): Observable<Product | undefined> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, where('slug', '==', slug));
    return collectionData(q, { idField: 'id' }).pipe(
      map(data => data as Product[]),
      map(products => products[0]));
  }

  createProduct(product: Product): Promise<void> {
    const productsRef = collection(this.firestore, 'products');
    return addDoc(productsRef, product as any).then(() => {});
  }

  updateProduct(id: string, updatedData: Partial<Product>): Promise<void> {
    const productRef = doc(this.firestore, `products/${id}`);
    return updateDoc(productRef, updatedData as any);
  }

  deleteProduct(id: string): Promise<void> {
    const productRef = doc(this.firestore, `products/${id}`);
    return deleteDoc(productRef);
  }
}