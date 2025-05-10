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

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  standalone: false
})

export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  userId: string= '';
  showModal: boolean = false;

  constructor(private cartService: CartService, private auth: Auth, private orderService: OrderService, private userService: UserService, private snackBar: MatSnackBar) {}

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      this.cartItems = await this.cartService.getCart(this.userId);
    }
  }

  get total() {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async increaseQuantity(item: CartItem) {
    if (!this.userId) return;
    item.quantity++;
    await this.cartService.setQuantity(this.userId, item);
    this.cartItems = await this.cartService.getCart(this.userId);
  }

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

  async handleOrderConfirm(data: { name: string; email: string; phone: string; address: string; save: boolean }) {
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

  openModal() {
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    document.body.style.overflow = 'auto';
  }
}