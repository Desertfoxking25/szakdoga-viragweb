import { AfterViewChecked, ElementRef, QueryList, ViewChildren, Component, OnInit } from '@angular/core';
import { Tip } from '../../shared/models/tip.model';
import { TipService } from '../../shared/services/tip.service';
import { Timestamp } from 'firebase/firestore';
import { UserService } from '../../shared/services/user.service';
import { Auth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Tipp oldal komponens.
 * Felhasználók tippeket küldhetnek be, törölhetnek (saját vagy admin jog esetén),
 * és egy beépített AI chatbot is elérhető (lokálisan tárolva).
 */
@Component({
  selector: 'app-tips',
  templateUrl: './tip.component.html',
  styleUrls: ['./tip.component.scss'],
  standalone: false
})
export class TipComponent implements OnInit, AfterViewChecked {
  /** Az összes tipp DOM elem referenciaja animációhoz */
  @ViewChildren('tipCard') tipElements!: QueryList<ElementRef>;

  private hasObserved = false;

  /** Tipp lista kiegészítve megjelenítési flaggel */
  tips: TipWithFlags[] = [];

  /** Az utoljára beküldött tipp ID-ja (scroll + highlight céljára) */
  lastAddedId: string | null = null;

  /** Felhasználó UID → név map (névmegjelenítéshez) */
  authorMap: { [uid: string]: string } = {};

  /** Új tipp adatai */
  newTip: Partial<Tip> = { title: '', content: '' };

  /** Bejelentkezett felhasználó ID-ja */
  currentUserId: string | null = null;

  /** Aktuális felhasználó admin-e */
  isAdmin: boolean = false;

  /** Látható tippek listája (IntersectionObserver-rel) */
  visibleTips: { [id: string]: boolean } = {};

  /** AI chat megnyitott állapota */
  chatOpen = false;

  /** Chat üzenetek lokálisan tárolva */
  chatMessages: { role: 'user' | 'assistant', content: string }[] = [];

  /** Lokális storage kulcs a chathez (userID alapú) */
  chatStorageKey: string | null = null;

  constructor(
    private tipService: TipService,
    private userService: UserService,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Inicializálás:
   * - auth figyelése,
   * - user profil lekérése (admin joghoz),
   * - chat előzmények betöltése,
   * - tippek betöltése.
   */
  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.chatStorageKey = `tip-chat-${user.uid}`;

        const saved = localStorage.getItem(this.chatStorageKey);
        if (saved) {
          this.chatMessages = JSON.parse(saved);
        }

        this.userService.getUserProfile(user.uid).subscribe(userData => {
          this.isAdmin = userData?.admin === true;
        });
      } else {
        this.currentUserId = null;
        this.chatStorageKey = null;
      }

      this.loadTips();
    });
  }

  /**
   * A chat üzenetek frissítése → elmentés localStorage-be.
   * @param updated Új üzenetlista
   */
  onMessagesChange(updated: { role: 'user' | 'assistant'; content: string }[]) {
    this.chatMessages = updated;
    if (this.chatStorageKey) {
      localStorage.setItem(this.chatStorageKey, JSON.stringify(updated));
    }
  }

  /**
   * Tippek betöltése a TipService-ből,
   * és szerzők neveinek hozzárendelése az authorMap-hez.
   */
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

  /**
   * Megfigyelés inicializálása a DOM-on, ha még nem történt meg.
   */
  ngAfterViewChecked() {
    if (!this.hasObserved && this.tipElements.length > 0) {
      this.observeTips();
      this.hasObserved = true;
    }
  }

  /**
   * Scroll alapú animációkhoz használatos IntersectionObserver.
   */
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

  /**
   * Új tipp beküldése:
   * - auth ellenőrzés,
   * - validáció,
   * - mentés Firestore-ba,
   * - snackbar visszajelzés.
   */
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

  /**
   * Tipp törlése: csak a saját tipp vagy adminként engedélyezett.
   * @param tip A törlendő tipp objektum
   */
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

  /**
   * Angular optimalizálás: ngFor trackBy függvény, tippek ID alapján.
   */
  trackById(index: number, tip: Tip): string {
    return tip.id!;
  }
}

/**
 * Kiegészített Tip típus, amely tartalmazza a `justAdded` megjelenítési flaget.
 */
interface TipWithFlags extends Tip {
  justAdded?: boolean;
}
