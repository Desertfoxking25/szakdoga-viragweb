import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router, private firestore: Firestore) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const requiresAdmin = route.data?.['requiresAdmin'] === true;
    if (requiresAdmin) {
      return this.checkAdminAccess(user.uid);
    }

    return true;
  }

  async checkAdminAccess(uid: string): Promise<boolean> {
    try {
      const userDoc = doc(this.firestore, `users/${uid}`);
      const userData: any = await firstValueFrom(docData(userDoc));
      if (userData?.admin === true) {
        return true;
      } else {
        alert('Nincs jogosultságod az admin felülethez.');
        this.router.navigate(['/']);
        return false;
      }
    } catch (err) {
      console.error('Hiba a jogosultság ellenőrzésénél:', err);
      this.router.navigate(['/']);
      return false;
    }
  }
}