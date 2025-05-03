import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, query, orderBy, Timestamp, DocumentReference } from '@angular/fire/firestore';
import { Tip } from '../models/tip.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipService {
  constructor(private firestore: Firestore) {}

  getTips(): Observable<Tip[]> {
    const tipRef = query(collection(this.firestore, 'tips'), orderBy('createdAt', 'desc'));
    return collectionData(tipRef, { idField: 'id' }) as Observable<Tip[]>;
  }

  addTip(tip: Tip): Promise<DocumentReference> {
    const tipRef = collection(this.firestore, 'tips');
    return addDoc(tipRef, {
      ...tip,
      createdAt: Timestamp.now()
    });
  }

  deleteTip(id: string): Promise<void> {
    const tipDoc = doc(this.firestore, 'tips', id);
    return deleteDoc(tipDoc);
  }
}