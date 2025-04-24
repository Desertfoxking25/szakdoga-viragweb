import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { Faq } from '../models/faq.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  constructor(private firestore: Firestore) {}

  getFaqs(): Observable<Faq[]> {
    const faqRef = collection(this.firestore, 'faqs');
    return collectionData(faqRef, { idField: 'id' }) as Observable<Faq[]>;
  }

  addFaq(faq: Faq): Promise<void> {
    const faqRef = collection(this.firestore, 'faqs');
    return addDoc(faqRef, faq).then(() => {});
  }

  deleteFaq(id: string): Promise<void> {
    const faqDoc = doc(this.firestore, 'faqs', id);
    return deleteDoc(faqDoc);
  }
}