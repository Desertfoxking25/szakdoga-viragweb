import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private auth: Auth, private router: Router) {}

  login() {
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(userCredential => {
        console.log('Bejelentkezés sikeres:', userCredential);
        alert("Sikeres bejelentkezés!");
        this.router.navigate(['/']);
      })
      .catch(error => {
        console.error('Hiba a bejelentkezés során:', error);
        alert('Hiba a bejelentkezés során: ' + error.message);
      });
  }
  
  goToMain() {
    this.router.navigate(['/']);
  }
}
