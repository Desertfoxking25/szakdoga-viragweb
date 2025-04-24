import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { UserProfile } from '../../../shared/models/user.model';
import { UserService } from '../../../shared/services/user.service';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  standalone: false
})
export class ProfileEditComponent implements OnInit {
  profile: UserProfile = {
    uid: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: ''
  };

  constructor(private userService: UserService, private auth: Auth, private firestore: Firestore, private router: Router) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.userService.getUserProfile(user.uid).subscribe(data => {
        this.profile = data;
      });
    }
  }

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
      email: existing.email,
      phone: this.profile.phone || existing.phone,
      address: this.profile.address || existing.address,
      avatarUrl: this.profile.avatarUrl || existing.avatarUrl,
    };
  
    await this.userService.updateUserProfile(updated as UserProfile);
    alert('Profil sikeresen frissítve!');
    location.reload();
  }

  goBack() {
    this.router.navigate(['/profile']);
  }
}