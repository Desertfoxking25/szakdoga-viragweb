import { Component } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(private auth: Auth, private router: Router, private userService: UserService, private firestore: Firestore, private snackBar: MatSnackBar) {}

  login() {
    if (!this.email || !this.password) {
      this.snackBar.open('⚠️ Kérlek, add meg az e-mail címet és a jelszót!', 'Bezárás', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-error']
      });
      return;
    }

    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(userCredential => {
        const user: User = userCredential.user;
  
        if (this.isAdminLogin) {
          const sub = this.userService.getUserById(user.uid).subscribe(userData => {
            const isAdmin = userData?.admin === true;
            this.userService.setIsAdmin(isAdmin); 

            if (this.isAdminLogin && isAdmin) {
              this.router.navigate(['/admin/products']);
            } else {
              this.router.navigate(['/']);
            }
            
            gtag('event', 'login', { method: 'email' });
            sub.unsubscribe();
          });
        } else {
          this.snackBar.open('✅ Sikeres bejelentkezés!', 'Bezárás', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['snackbar-success']
          });
          this.router.navigate(['/']);
          gtag('event', 'login', { method: 'email' });
        }
      })
      .catch(error => {
        console.error('Hiba a bejelentkezés során:', error);
        this.snackBar.open('❌ Hibás e-mail cím vagy jelszó!', 'Bezárás', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
        this.email = '';
        this.password = '';
      });
  }

  googleLogin(): void {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(result => {
        console.log('Google bejelentkezés sikeres:', result.user);
        this.snackBar.open('✅ Sikeres bejelentkezés!', 'Bezárás', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['/']);
        gtag('event', 'login', { method: 'Google' });
      })
      .catch(error => {
        console.error('Hiba Google bejelentkezéskor:', error);
        this.snackBar.open('❌ Hiba a Google bejelentkezés során!', 'Bezárás', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
      });
  }

  async register() {
      if (this.password !== this.confirmPassword) {
        this.snackBar.open('❌ A jelszavak nem egyeznek!', 'Bezárás', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
        this.password = '';
        this.confirmPassword = '';
        return;
      }

      if (!this.lastname || !this.firestore || !this.email || !this.password || !this.confirmPassword) {
        this.snackBar.open('⚠️ Kérlek, minden mezőt tölts ki!', 'Bezárás', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
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

        this.snackBar.open('✅ Sikeres regisztráció!', 'Bezárás', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
  
        this.router.navigate(['/']);
        gtag('event', 'sign_up', { method: 'email'});
        
      } catch (err: any) {
        let message = 'Ismeretlen hiba történt.';

        switch (err.code) {
          case 'auth/weak-password':
            message = 'A jelszónak legalább 6 karakter hosszúnak kell lennie!';
            this.password = '';
            this.confirmPassword = '';
            break;
          case 'auth/email-already-in-use':
            message = 'Ez az e-mail cím már használatban van!';
            this.email = '';
            break;
          case 'auth/invalid-email':
            message = 'Érvénytelen e-mail cím!';
            this.email = '';
            break;
          default:
            message = err.message;
            break;
        }

        this.snackBar.open('❌ ' + message, 'Bezárás', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
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