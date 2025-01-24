import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false
})
export class RegisterComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register(this.email, this.password).then(() => {
      console.log('Sikeres regisztráció');
      alert('Sikeres regisztráció!');
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Hiba a regisztráció során:', error);
      alert('Hiba a regisztráció során: ' + error.message);
    });
  }

  goToMain() {
    this.router.navigate(['/']);
  }
}

