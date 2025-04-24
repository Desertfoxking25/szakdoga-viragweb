import { Component } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false
})
export class RegisterComponent {
  lastname = '';
  firstname = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {}

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
        avatarUrl: ''
      });

      this.router.navigate(['/profile']);
    } catch (err: any) {
      this.error = err.message;
    }
  }
}