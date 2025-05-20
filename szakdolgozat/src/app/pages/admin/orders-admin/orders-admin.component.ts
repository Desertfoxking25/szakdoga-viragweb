import { Component, OnInit } from '@angular/core';
import { Order } from '../../../shared/models/order.model';
import { OrderService } from '../../../shared/services/order.service';
import { UserService } from '../../../shared/services/user.service';

/**
 * Adminfelület a felhasználói rendelések kezelésére.
 * Tartalmaz rendeléslistát, státuszfrissítést, törlést és szűrést dátum + státusz alapján.
 */
@Component({
  selector: 'app-orders-admin',
  templateUrl: './orders-admin.component.html',
  styleUrl: './orders-admin.component.scss',
  standalone: false
})
export class OrdersAdminComponent implements OnInit {

  /** Minden rendelés, amit az admin lát */
  orders: Order[] = [];

  /** A megjelenítendő táblázatos oszlopok */
  displayedColumns: string[] = ['userId', 'items', 'totalPrice', 'createdAt', 'status', 'actions'];

  /** UID → teljes név hozzárendelés */
  userMap: { [uid: string]: string } = {};

  /** Státusz szűrő aktuális értéke */
  statusFilter: string = 'all';

  /** Szűrt rendeléslista */
  filteredOrders: Order[] = [];

  /** Szűréshez: kezdődátum */
  fromDate: string = '';

  /** Szűréshez: végdátum */
  toDate: string = '';

  /** Státusz választási lehetőségek */
  statusOptions: ('új' | 'feldolgozás alatt' | 'teljesítve')[] = ['új', 'feldolgozás alatt', 'teljesítve'];

  constructor(private orderService: OrderService, private userService: UserService) {}

  /**
   * Komponens inicializálásakor betölti a rendeléseket és hozzárendeli a felhasználóneveket.
   */
  ngOnInit(): void {
    this.loadOrders();
  }

  /**
   * Lekéri az összes rendelést és frissíti a userMap-et és a szűrt listát.
   */
  loadOrders(): void {
    this.orderService.getAllOrders().subscribe(data => {
      this.orders = data;
      this.applyFilter();

      this.orders.forEach(order => {
        if (order.userId && !this.userMap[order.userId]) {
          this.userService.getUserProfile(order.userId).subscribe(user => {
            this.userMap[order.userId] = `${user.firstname} ${user.lastname}`;
          });
        }
      });
    });
  }

  /**
   * Rendelés törlése megerősítéssel.
   * @param orderId A törlendő rendelés Firestore azonosítója
   */
  deleteOrder(orderId: string): void {
    const confirmed = confirm('Biztosan törlöd ezt a rendelést?');
    if (confirmed) {
      this.orderService.deleteOrder(orderId).then(() => {
        this.loadOrders();
      });
    }
  }

  /**
   * Rendelés státuszának frissítése. A 'teljesítve' státusz esetén megerősítést kér.
   * @param order A frissítendő rendelés
   * @param newStatus Az új státusz értéke
   */
  updateOrderStatus(order: Order, newStatus: 'új' | 'feldolgozás alatt' | 'teljesítve'): void {
    if (!order.id || order.status === newStatus) return;

    if (newStatus === 'teljesítve') {
      const confirmed = confirm('Biztosan teljesítve állítod ezt a rendelést?');
      if (!confirmed) return;
    }

    this.orderService.updateOrder(order.id, { status: newStatus }).then(() => {
      this.loadOrders();
    });
  }

  /**
   * Szűrés alkalmazása a státusz és dátum mezők alapján.
   */
  applyFilter(): void {
    let filtered = this.orders;

    // Státusz szűrés
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Kezdődátum szűrés
    if (this.fromDate) {
      const from = new Date(this.fromDate);
      filtered = filtered.filter(order => order.createdAt.toDate() >= from);
    }

    // Végdátum szűrés (23:59:59-re állítva)
    if (this.toDate) {
      const to = new Date(this.toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => order.createdAt.toDate() <= to);
    }

    this.filteredOrders = filtered;
  }
}
