import { Injectable } from '@angular/core';
import { Firestore, doc, docData, setDoc, getDoc } from '@angular/fire/firestore';
import { UserProfile } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: Firestore) {}

  getUserProfile(uid: string): Observable<UserProfile> {
    const userRef = doc(this.firestore, 'users', uid);
    return docData(userRef) as Observable<UserProfile>;
  }

  async updateUserProfile(profile: UserProfile): Promise<void> {
    const userRef = doc(this.firestore, 'users', profile.uid);
    await setDoc(userRef, profile, { merge: true });
  }

  async createUserProfileIfMissing(profile: UserProfile): Promise<void> {
    const userRef = doc(this.firestore, 'users', profile.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, profile);
    }
  }
}