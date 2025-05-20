import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { UserProfile } from '../../../shared/models/user.model';
import { UserService } from '../../../shared/services/user.service';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Felhasználói profil szerkesztő oldal.
 * Betölti a bejelentkezett felhasználó adatait, módosítás után elmenti őket Firestore-ba.
 * Egyszerű animációval és vizuális visszajelzéssel működik.
 */
@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  standalone: false
})
export class ProfileEditComponent implements OnInit {

  /**
   * A felhasználó szerkeszthető profiladatai.
   */
  profile: UserProfile = {
    uid: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: ''
  };

  /** Komponens láthatósági flag animációhoz (fade-in/out) */
  visible = false;

  /** Kilépési animáció flag (visszalépéskor) */
  isClosing = false;

  /**
   * Konstruktor: szükséges szolgáltatások injektálása.
   * @param userService Firestore műveletek a profilhoz
   * @param auth Firebase Auth példány
   * @param firestore Firestore példány (direkt lekérdezéshez)
   * @param router Angular Router
   * @param snackBar Material Snackbar visszajelzéshez
   */
  constructor(
    private userService: UserService,
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Az oldal betöltésekor:
   * - betölti a felhasználó profilját,
   * - elindítja a belépő animációt.
   */
  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.userService.getUserProfile(user.uid).subscribe(data => {
        this.profile = data;
      });
    }

    setTimeout(() => {
      this.visible = true;
    }, 10);
  }

  /**
   * Profil mentése Firestore-ba:
   * - meglévő adatokat új adatokkal frissíti,
   * - ha egy mező üres, megtartja a régit,
   * - sikeres mentés után visszanavigál a profil oldalra.
   */
  async saveProfile() {
    const user = this.auth.currentUser;
    if (!user) return;

    const userRef = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(userRef);
    const existing = snap.data() as UserProfile;

    const updated: Partial<UserProfile> = {
      uid: user.uid,
      firstname: this.profile.firstname || existing.firstname,
      lastname: this.profile.lastname || existing.lastname,
      email: existing.email, // Email nem módosítható itt
      phone: this.profile.phone || existing.phone,
      address: this.profile.address || existing.address,
      avatarUrl: this.profile.avatarUrl || existing.avatarUrl,
    };

    await this.userService.updateUserProfile(updated as UserProfile);

    this.snackBar.open('✅ Profil frissítve!', 'Bezárás', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });

    this.router.navigate(['/profile']);
  }

  /**
   * Visszalépés a profil oldalra animációval.
   */
  goBack() {
    this.isClosing = true;
    this.visible = false;

    setTimeout(() => {
      this.router.navigate(['/profile']);
    }, 300);
  }
}
