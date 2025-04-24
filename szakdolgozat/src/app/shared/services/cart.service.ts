import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CartItem } from '../models/CartItem.model';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async getCart(userId: string): Promise<CartItem[]> {
    const ref = doc(this.firestore, 'carts', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data()['items'] || [];
    } else {
      return [];
    }
  }

  async addToCart(userId: string, item: CartItem): Promise<void> {
    const ref = doc(this.firestore, 'carts', userId);
    const snap = await getDoc(ref);
    let items: CartItem[] = [];
  
    if (snap.exists()) {
      items = snap.data()['items'] || [];
      const index = items.findIndex(i => i.productId === item.productId);
      if (index !== -1) {
        items[index].quantity += item.quantity;
      } else {
        items.push(item);
      }
    } else {
      items = [item];
    }
  
    await setDoc(ref, { items });
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    const ref = doc(this.firestore, 'carts', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    let items: CartItem[] = snap.data()['items'] || [];
    items = items.filter(i => i.productId !== productId);
    await updateDoc(ref, { items });
  }

  async setQuantity(userId: string, item: CartItem): Promise<void> {
    const ref = doc(this.firestore, 'carts', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
  
    let items: CartItem[] = snap.data()['items'] || [];
    const index = items.findIndex(i => i.productId === item.productId);
    if (index !== -1) {
      items[index].quantity = item.quantity;
      await setDoc(ref, { items });
    }
  }

  async clearCart(userId: string): Promise<void> {
    const ref = doc(this.firestore, 'carts', userId);
    await setDoc(ref, { items: [] });
  }
}