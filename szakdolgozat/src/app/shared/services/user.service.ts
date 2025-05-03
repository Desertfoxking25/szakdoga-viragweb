import { Injectable } from '@angular/core';
import { Firestore, doc, docData, setDoc, getDoc } from '@angular/fire/firestore';
import { UserProfile } from '../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private adminSubject = new BehaviorSubject<boolean>(false);
  admin$: Observable<boolean> = this.adminSubject.asObservable();  

  constructor(private firestore: Firestore, private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const userRef = doc(this.firestore, 'users', user.uid);
        docData(userRef).subscribe((data: any) => {
          this.adminSubject.next(data?.admin === true);
        });
      } else {
        this.adminSubject.next(false);
      }
    });
  }

  setIsAdmin(value: boolean) {
    this.adminSubject.next(value);
  }

  getIsAdmin(): boolean {
    return this.adminSubject.value;
  }

  getUserById(uid: string): Observable<any> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    return docData(userDoc);
  }

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