import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../shared/models/CartItem.model';
import { CartService } from '../../shared/services/cart.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  standalone: false
})

export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  userId: string | null = null;

  constructor(private cartService: CartService, private auth: Auth) {}

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
  }
}