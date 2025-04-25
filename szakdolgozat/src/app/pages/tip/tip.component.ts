import { Component, OnInit } from '@angular/core';
import { Tip } from '../../shared/models/tip.model';
import { TipService } from '../../shared/services/tip.service';
import { Timestamp } from 'firebase/firestore';
import { UserProfile } from '../../shared/models/user.model';
import { UserService } from '../../shared/services/user.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-tips',
  templateUrl: './tip.component.html',
  styleUrls: ['./tip.component.scss'],
  standalone: false
})
export class TipComponent implements OnInit {
  tips: Tip[] = [];
  authorMap: { [uid: string]: string } = {};
  newTip: Partial<Tip> = { title: '', content: '' };
  currentUserId: string | null = null;
  isAdmin: boolean = false;

  constructor(private tipService: TipService, private userService: UserService, private auth: Auth) {}

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid;

        this.userService.getUserProfile(user.uid).subscribe(userData => {
          this.isAdmin = userData?.admin === true;
        });
      }
  
      this.tipService.getTips().subscribe(data => {
        this.tips = data;
  
        this.tips.forEach(tip => {
          if (tip.authorId && !this.authorMap[tip.authorId]) {
            this.userService.getUserProfile(tip.authorId).subscribe(user => {
              this.authorMap[tip.authorId!] = `${user.lastname} ${user.firstname}`;
            });
          }
        });
      });
    });
  }

  async addTip() {
    const user = this.auth.currentUser;
    if (!user) {
      alert('Be kell jelentkezned a tipp beküldéséhez!');
      return;
    }
  
    if (!this.newTip.title || !this.newTip.content) {
      alert('Minden mező kitöltése kötelező!');
      return;
    }
  
    const tipToSend: Tip = {
      title: this.newTip.title!,
      content: this.newTip.content!,
      authorId: user.uid,
      createdAt: Timestamp.now()
    };
  
    await this.tipService.addTip(tipToSend);
    this.newTip = { title: '', content: '' };
  }

  async deleteTip(tip: Tip) {
    const user = this.auth.currentUser;
    if (!user) return;

    if (tip.authorId === user.uid || this.isAdmin) {
      const confirmed = confirm('Biztosan törölni szeretnéd ezt a tippet?');
      if (confirmed) {
        await this.tipService.deleteTip(tip.id!);
      }
    } else {
      alert('Nincs jogosultságod törölni ezt a tippet.');
    }
  }
}