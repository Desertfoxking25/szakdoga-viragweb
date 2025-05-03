import { AfterViewChecked, ElementRef, QueryList, ViewChildren, Component, OnInit } from '@angular/core';
import { Tip } from '../../shared/models/tip.model';
import { TipService } from '../../shared/services/tip.service';
import { Timestamp } from 'firebase/firestore';
import { UserService } from '../../shared/services/user.service';
import { Auth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tips',
  templateUrl: './tip.component.html',
  styleUrls: ['./tip.component.scss'],
  standalone: false
})
export class TipComponent implements OnInit, AfterViewChecked {
  @ViewChildren('tipCard') tipElements!: QueryList<ElementRef>;
  private hasObserved = false;
  tips: TipWithFlags[] = [];
  lastAddedId: string | null = null;
  authorMap: { [uid: string]: string } = {};
  newTip: Partial<Tip> = { title: '', content: '' };
  currentUserId: string | null = null;
  isAdmin: boolean = false;
  visibleTips: { [id: string]: boolean } = {};

  constructor(private tipService: TipService, private userService: UserService, private auth: Auth, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.userService.getUserProfile(user.uid).subscribe(userData => {
          this.isAdmin = userData?.admin === true;
        });
      }

      this.loadTips();
    });
  }

  loadTips() {
    this.tipService.getTips().subscribe(data => {
      this.tips = data.map(tip => ({
        ...tip,
        justAdded: tip.id === this.lastAddedId
      }));
      this.lastAddedId = null;
  
      this.tips.forEach(tip => {
        if (tip.authorId && !this.authorMap[tip.authorId]) {
          this.userService.getUserProfile(tip.authorId).subscribe(user => {
            this.authorMap[tip.authorId!] = `${user.lastname} ${user.firstname}`;
          });
        }
      });
  
      this.hasObserved = false;
    });
  }

  ngAfterViewChecked() {
    if (!this.hasObserved && this.tipElements.length > 0) {
      this.observeTips();
      this.hasObserved = true;
    }
  }

  observeTips() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('data-id');
        if (entry.isIntersecting && id) {
          this.visibleTips[id] = true;
        }
      });
    }, { threshold: 0.1 });

    this.tipElements.forEach(el => observer.observe(el.nativeElement));
  }

  async addTip() {
    const user = this.auth.currentUser;
    if (!user) {
      this.snackBar.open('❌ Be kell jelentkezned a tipp beküldéséhez!', 'Bezárás', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-error']
      });
      return;
    }
  
    if (!this.newTip.title || !this.newTip.content) {
      this.snackBar.open('⚠️ Minden mező kitöltése kötelező!', 'Bezárás', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-error']
      });
      return;
    }
  
    const tipToSend: Tip = {
      title: this.newTip.title!,
      content: this.newTip.content!,
      authorId: user.uid,
      createdAt: Timestamp.now()
    };
  
    const docRef = await this.tipService.addTip(tipToSend);
    this.lastAddedId = docRef.id;
    this.newTip = { title: '', content: '' };

    this.snackBar.open('✅ Tipp sikeresen beküldve!', 'Bezárás', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });
  }

  async deleteTip(tip: Tip) {
    const user = this.auth.currentUser;
    if (!user) return;

    if (tip.authorId === user.uid || this.isAdmin) {
      const confirmed = confirm('Biztosan törölni szeretnéd ezt a tippet?');
      if (confirmed) {
        await this.tipService.deleteTip(tip.id!);
        this.snackBar.open('✅ Tipp törölve.', 'Bezárás', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
      }
    } else {
      this.snackBar.open('❌ Nincs jogosultságod törölni ezt a tippet.', 'Bezárás', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-error']
      });
    }
  }

  trackById(index: number, tip: Tip): string {
    return tip.id!;
  }
}

interface TipWithFlags extends Tip {
  justAdded?: boolean;
}