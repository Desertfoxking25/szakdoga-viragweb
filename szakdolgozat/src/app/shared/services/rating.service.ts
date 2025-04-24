import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, addDoc, doc, updateDoc, getDocs } from '@angular/fire/firestore';
import { Rating } from '../models/rating.model';
import { Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private ratingsRef;

  constructor(private firestore: Firestore) {
    this.ratingsRef = collection(this.firestore, 'ratings');
  }

  getRatingsByProduct(productId: string) {
    const q = query(this.ratingsRef, where('productId', '==', productId));
    return collectionData(q, { idField: 'id' }) as unknown as Observable<Rating[]>;
  }
  
  async getUserRatingForProduct(userId: string, productId: string): Promise<Rating | null> {
    const q = query(this.ratingsRef,
      where('productId', '==', productId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...(snapshot.docs[0].data() as Rating)
    };
  }

  async addOrUpdateRating(rating: Rating): Promise<void> {
    const existing = await this.getUserRatingForProduct(rating.userId, rating.productId);

    if (existing) {
      const ratingDoc = doc(this.firestore, 'ratings', existing.id!);
      await updateDoc(ratingDoc, {
        stars: rating.stars,
        createdAt: Timestamp.now()
      });
    } else {
      await addDoc(this.ratingsRef, {
        ...rating,
        createdAt: Timestamp.now()
      });
    }
  }
}