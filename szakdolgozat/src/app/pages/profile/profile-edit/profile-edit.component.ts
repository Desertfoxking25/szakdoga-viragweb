import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { UserProfile } from '../../../shared/models/user.model';
import { UserService } from '../../../shared/services/user.service';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  visible = false;
  isClosing = false;

  constructor(private userService: UserService, private auth: Auth, private firestore: Firestore, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.userService.getUserProfile(user.uid).subscribe(data => {
        this.profile = data;
      });
    }

    setTimeout(() => {
      this.visible = true;
    }, 10);
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
    this.snackBar.open('✅ Profil frissitve!', 'Bezárás', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });
    location.reload();
  }

  goBack() {
    this.isClosing = true;
    this.visible = false;

    setTimeout(() => {
      this.router.navigate(['/profile']);
    }, 300);
  }
}