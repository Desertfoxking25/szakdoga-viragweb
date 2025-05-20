import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { UserProfile } from '../../../shared/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Rendelés megerősítő modal ablak.
 * Betölti és előtölti a felhasználói adatokat, lehetővé teszi a megrendelés leadását
 * és opcionálisan a profiladatok frissítését is.
 */
@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss'],
  standalone: false
})
export class OrderModalComponent implements OnInit {

  /**
   * Kosár végösszeg, Ft-ban.
   */
  @Input() total: number = 0;

  /**
   * Bejelentkezett felhasználó UID-ja, szükséges a profil betöltéséhez.
   */
  @Input() userId: string = '';

  /**
   * Esemény a modal bezárására (pl. overlay vagy gomb).
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Esemény a rendelés megerősítésére, a form adataival.
   */
  @Output() confirm = new EventEmitter<{
    name: string;
    email: string;
    phone: string;
    address: string;
    save: boolean;
  }>();

  /** Felhasználó neve (vezetéknév + keresztnév) */
  name: string = '';

  /** Email cím (nem módosítható) */
  email: string = '';

  /** Telefonszám */
  phone: string = '';

  /** Szállítási cím */
  address: string = '';

  /** Mentse-e az adatokat profilba */
  save: boolean = false;

  /** Modal megjelenési animáció vezérlése */
  modalVisible = false;

  /** Kilépési animáció állapota */
  isClosing = false;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Inicializáláskor betölti a felhasználói profilt (ha van),
   * és beállítja az animált megjelenést.
   */
  ngOnInit(): void {
    if (this.userId) {
      this.userService.getUserProfile(this.userId).subscribe((profile: UserProfile) => {
        this.name = `${profile.firstname} ${profile.lastname}`;
        this.email = profile.email;
        this.phone = profile.phone || '';
        this.address = profile.address || '';
      });
    }

    // Animált nyitás (10ms késleltetés a CSS átmenet miatt)
    setTimeout(() => {
      this.modalVisible = true;
    }, 10);
  }

  /**
   * Beküldi a rendelési adatokat, ha a form érvényes.
   * Ha nem érvényes, hibát jelenít meg.
   * @param form Az Angular űrlap referenciája
   */
  submitOrder(form: any) {
    if (form.invalid) {
      this.snackBar.open('⚠️ Kérlek tölts ki minden mezőt!', 'Bezárás', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.confirm.emit({
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      save: this.save
    });
  }

  /**
   * Modal zárása animációval.
   * 300ms késleltetés után küldi az eseményt a szülő komponensnek.
   */
  closeWithAnimation() {
    this.modalVisible = false;
    setTimeout(() => this.close.emit(), 300);
  }
}
