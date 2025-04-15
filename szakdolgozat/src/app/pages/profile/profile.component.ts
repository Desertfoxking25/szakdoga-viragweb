import { Component, OnInit } from '@angular/core';
import { getAuth, User } from 'firebase/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  ngOnInit(): void {
    const auth = getAuth();
    this.user = auth.currentUser;
  }

  logout() {
    const auth = getAuth();
    auth.signOut();
  }
}