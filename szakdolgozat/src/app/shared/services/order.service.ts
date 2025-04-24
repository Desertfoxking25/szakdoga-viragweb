import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, where, Timestamp, doc, setDoc } from '@angular/fire/firestore';
import { Order } from '../models/order.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private firestore: Firestore) {}

  getOrdersByUser(userId: string): Observable<Order[]> {
    const ordersRef = collection(this.firestore, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }

  addOrder(order: Order): Promise<void> {
    const ordersRef = collection(this.firestore, 'orders');
    return addDoc(ordersRef, {
      ...order,
      createdAt: Timestamp.now(),
      status: 'új'
    }).then(() => {});
  }
}