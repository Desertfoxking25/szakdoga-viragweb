import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, where, Timestamp, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Order } from '../models/order.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private firestore: Firestore) {}

  getAllOrders(): Observable<Order[]> {
    const ordersRef = collection(this.firestore, 'orders');
    return collectionData(ordersRef, { idField: 'id' }) as Observable<Order[]>;
  }

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

  updateOrder(id: string, data: Partial<Order>): Promise<void> {
    const orderDoc = doc(this.firestore, 'orders', id);
    return updateDoc(orderDoc, data as any);
  }

  deleteOrder(id: string): Promise<void> {
    const orderDoc = doc(this.firestore, 'orders', id);
    return deleteDoc(orderDoc);
  }
}