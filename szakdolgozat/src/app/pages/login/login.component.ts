import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

declare let gtag: Function;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isAdminLogin: boolean = false;

  constructor(private auth: Auth, private router: Router, private userService: UserService) {}

  login() {
    if (!this.email || !this.password) {
      alert('Kérlek, add meg az e-mail címet és a jelszót!');
      return;
    }

    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(userCredential => {
        const user: User = userCredential.user;
  
        if (this.isAdminLogin) {
          const sub = this.userService.getUserById(user.uid).subscribe(userData => {
            if (userData?.admin === true) {
              alert('Sikeres admin bejelentkezés!');
              this.router.navigate(['/admin/products']);
            } else {
              alert('Nincs jogosultságod az admin felülethez!');
              this.router.navigate(['/']);
            }
            gtag('event', 'login', { method: 'email' });
            sub.unsubscribe();
          });
        } else {
          alert('Sikeres bejelentkezés!');
          this.router.navigate(['/']);
          gtag('event', 'login', { method: 'email' });
        }
      })
      .catch(error => {
        console.error('Hiba a bejelentkezés során:', error);
        alert('Hibás e-mail cím vagy jelszó');
      });
  }

  googleLogin(): void {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(result => {
        console.log('Google bejelentkezés sikeres:', result.user);
        alert('Sikeres Google bejelentkezés!');
        this.router.navigate(['/']);
        gtag('event', 'login', { method: 'Google' });
      })
      .catch(error => {
        console.error('Hiba Google bejelentkezéskor:', error);
        alert('Hiba a Google bejelentkezés során: ' + error.message);
      });
  }
  
  goToMain() {
    this.router.navigate(['/']);
  }
}