import { Component, OnInit } from '@angular/core';
import { Auth, getAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserProfile } from '../../shared/models/user.model';
import { UserService } from '../../shared/services/user.service';

/**
 * A bejelentkezett felhasználó profiloldala.
 * Megjeleníti az aktuális felhasználói adatokat,
 * lehetőséget biztosít a profil szerkesztésére és kijelentkezésre.
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit {

  /**
   * Az aktuális felhasználó profiladatai.
   * Null, amíg nem töltődnek be.
   */
  profile: UserProfile | null = null;

  /**
   * Konstruktor: szolgáltatások injectálása.
   * @param auth Firebase Auth példány (aktuális felhasználóhoz)
   * @param userService Firestore alapú profilbetöltés
   * @param router Angular Router a navigációhoz
   */
  constructor(
    private auth: Auth,
    private userService: UserService,
    private router: Router
  ) {}

  /**
   * Az oldal betöltésekor lekéri a bejelentkezett felhasználó profilját.
   */
  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.userService.getUserProfile(user.uid).subscribe(data => {
        this.profile = data;
      });
    }
  }

  /**
   * Átnavigál a profil szerkesztő oldalra.
   */
  editProfile() {
    this.router.navigate(['/profile/edit']);
  }

  /**
   * Kijelentkezteti a felhasználót, majd a főoldalra irányítja.
   */
  logout() {
    const auth = getAuth();
    auth.signOut();
    this.router.navigate(['/']);
  }
}
