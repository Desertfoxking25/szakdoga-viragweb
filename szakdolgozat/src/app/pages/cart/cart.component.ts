import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../shared/models/CartItem.model';
import { CartService } from '../../shared/services/cart.service';
import { Auth } from '@angular/fire/auth';
import { Order } from '../../shared/models/order.model';
import { OrderService } from '../../shared/services/order.service';
import { Timestamp } from '@firebase/firestore';
import { UserService } from '../../shared/services/user.service';
import { UserProfile } from '../../shared/models/user.model';
import emailjs from 'emailjs-com';
import { MatSnackBar } from '@angular/material/snack-bar';

declare let gtag: Function;

/**
 * Kosár oldal, ahol a felhasználó:
 * - megtekintheti és szerkesztheti a kosár tartalmát,
 * - megrendelést adhat le,
 * - email visszaigazolást kap,
 * - és frissítheti a profilját is a rendelési adatok alapján.
 */
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  standalone: false
})
export class CartComponent implements OnInit {

  /** Kosárban lévő termékek */
  cartItems: CartItem[] = [];

  /** Bejelentkezett felhasználó UID */
  userId: string = '';

  /** Rendelés megerősítő modal megjelenítése */
  showModal: boolean = false;

  constructor(
    private cartService: CartService,
    private auth: Auth,
    private orderService: OrderService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Kosár betöltése bejelentkezett felhasználóhoz az oldal betöltésekor.
   */
  async ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      this.cartItems = await this.cartService.getCart(this.userId);
    }
  }

  /** Teljes kosárérték számítása */
  get total() {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * Termék mennyiségének növelése.
   * @param item A kosár elem
   */
  async increaseQuantity(item: CartItem) {
    if (!this.userId) return;
    item.quantity++;
    await this.cartService.setQuantity(this.userId, item);
    this.cartItems = await this.cartService.getCart(this.userId);
  }

  /**
   * Termék mennyiségének csökkentése vagy eltávolítása a kosárból.
   * @param item A kosár elem
   */
  async decreaseQuantity(item: CartItem) {
    if (!this.userId) return;
    const originalQuantity = item.quantity;
    item.quantity--;

    if (item.quantity <= 0) {
      const confirmed = confirm(`Biztosan törlöd a(z) "${item.name}" terméket a kosaradból?`);
      if (confirmed) {
        await this.cartService.removeFromCart(this.userId, item.productId);
        this.snackBar.open(`✅ ${item.name} termék törölve.`, 'Bezárás', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
      } else {
        item.quantity = originalQuantity;
      }
    } else {
      await this.cartService.setQuantity(this.userId, item);
    }

    this.cartItems = await this.cartService.getCart(this.userId);
  }

  /**
   * Termék teljes eltávolítása a kosárból.
   * @param item A törlendő termék
   */
  async removeItem(item: CartItem) {
    if (!this.userId) return;
    await this.cartService.removeFromCart(this.userId, item.productId);
    this.cartItems = await this.cartService.getCart(this.userId);

    this.snackBar.open(`✅ ${item.name} termék törölve.`, 'Bezárás', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });
  }

  /**
   * Rendelés leadása:
   * - mentés adatbázisba,
   * - email küldés,
   * - kosár törlés,
   * - Analytics esemény,
   * - profil frissítés, ha szükséges.
   * @param data Vásárlói adatok (formból)
   */
  async handleOrderConfirm(data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    save: boolean;
  }) {
    const user = this.auth.currentUser;
    if (!user || this.cartItems.length === 0) return;

    const order: Order = {
      userId: user.uid,
      items: this.cartItems,
      totalPrice: this.total,
      createdAt: Timestamp.now(),
      status: 'új',
    };

    await this.orderService.addOrder(order);
    this.sendConfirmationEmail(order, data.email);
    await this.cartService.clearCart(user.uid);

    // Google Analytics purchase esemény
    gtag('event', 'purchase', {
      transaction_id: Math.floor(Math.random() * 1000000),
      value: this.total,
      currency: 'HUF',
      items: this.cartItems.map(item => ({
        item_name: item.name,
        item_id: item.productId,
        price: item.price,
        quantity: item.quantity
      }))
    });

    this.cartItems = [];
    this.showModal = false;
    document.body.style.overflow = 'auto';

    // Profil frissítés a rendelési adatok alapján
    if (data.save) {
      const profile: UserProfile = {
        uid: user.uid,
        lastname: data.name.split(' ')[0] || '',
        firstname: data.name.split(' ')[1] || '',
        email: user.email!,
        phone: data.phone,
        address: data.address
      };
      await this.userService.updateUserProfile(profile);
    }

    this.snackBar.open('Rendelés sikeresen leadva!', 'Bezárás', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });
  }

  /**
   * Megrendelés visszaigazoló email küldése a megadott címre.
   * @param order A leadott rendelés
   * @param userEmail A vásárló email címe
   */
  sendConfirmationEmail(order: Order, userEmail: string) {
    const templateParams = {
      order_id: Math.floor(Math.random() * 1000000),
      email: userEmail,
      cost_shipping: 0,
      cost_total: order.totalPrice,
      orders: order.items.map(item => ({
        name: item.name,
        price: item.price * item.quantity,
        units: item.quantity,
        image_url: item.imgUrl
      }))
    };

    emailjs.send('service_flowerweb', 'template_orderConfirm', templateParams, 'K2v3Gv38p90y_3QWM')
      .then((response) => {
        console.log('Email elküldve!', response.status, response.text);
      }, (error) => {
        console.error('Email küldési hiba:', error);
      });
  }

  /** Rendelési modal megnyitása */
  openModal() {
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  /** Modal bezárása és scroll visszaállítása */
  closeModal() {
    this.showModal = false;
    document.body.style.overflow = 'auto';
  }
}
