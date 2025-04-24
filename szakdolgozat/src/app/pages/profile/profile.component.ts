import { Component, OnInit } from '@angular/core';
import { Auth, getAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserProfile } from '../../shared/models/user.model';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;

  constructor(private auth: Auth, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.userService.getUserProfile(user.uid).subscribe(data => {
        this.profile = data;
      });
    }
  }

  editProfile() {
    this.router.navigate(['/profile/edit']);
  }

  logout() {
    const auth = getAuth();
    auth.signOut();
  }
}