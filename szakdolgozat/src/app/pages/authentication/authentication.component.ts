import { Component } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

declare let gtag: Function;

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
  standalone: false
})
export class AuthenticationComponent {
  email: string = '';
  password: string = '';
  isAdminLogin: boolean = false;
  isRegisterMode = false;
  lastname = '';
  firstname = '';
  confirmPassword = '';
  error = '';

  constructor(private auth: Auth, private router: Router, private userService: UserService, private firestore: Firestore) {}

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

  async register() {
      if (this.password !== this.confirmPassword) {
        this.error = 'A jelszavak nem egyeznek!';
        return;
      }
  
      try {
        const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
        const uid = userCredential.user.uid;
  
        await setDoc(doc(this.firestore, 'users', uid), {
          uid,
          lastname: this.lastname,
          firstname: this.firstname,
          email: this.email,
          phone: '',
          address: '',
          avatarUrl: '',
          admin: false
        });
  
        this.router.navigate(['/']);
        gtag('event', 'sign_up', {
          method: 'email'
        });
      } catch (err: any) {
        this.error = err.message;
      }
    }
  
  goToMain() {
    this.router.navigate(['/']);
  }

  switchToRegister() {
    this.isRegisterMode = true;
  }

  switchToLogin() {
    this.isRegisterMode = false;
  }
}