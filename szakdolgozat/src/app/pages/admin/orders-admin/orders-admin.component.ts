import { Component, OnInit } from '@angular/core';
import { Order } from '../../../shared/models/order.model';
import { OrderService } from '../../../shared/services/order.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-orders-admin',
  templateUrl: './orders-admin.component.html',
  styleUrl: './orders-admin.component.scss',
  standalone: false
})
export class OrdersAdminComponent implements OnInit{
  orders: Order[] = [];
  displayedColumns: string[] = ['userId', 'items', 'totalPrice', 'createdAt', 'status', 'actions'];
  userMap: { [uid: string]: string } = {};
  statusFilter: string = 'all'; 
  filteredOrders: Order[] = [];
  fromDate: string = '';
  toDate: string = ''; 
  statusOptions: ('új' | 'feldolgozás alatt' | 'teljesítve')[] = ['új', 'feldolgozás alatt', 'teljesítve'];

  constructor(private orderService: OrderService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

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

  deleteOrder(orderId: string): void {
    const confirmed = confirm('Biztosan törlöd ezt a rendelést?');
    if (confirmed) {
      this.orderService.deleteOrder(orderId).then(() => {
        this.loadOrders();
      });
    }
  }

  updateOrderStatus(order: Order, newStatus: 'új' | 'feldolgozás alatt' | 'teljesítve'): void {
    if (!order.id || order.status === newStatus) return;

    if (newStatus === 'teljesítve') {
      const confirmed = confirm('Biztosan teljesítve állítod ezt a rendelést?');
      if (!confirmed) {
        return;
      }
    }

    this.orderService.updateOrder(order.id, { status: newStatus }).then(() => {
      this.loadOrders();
    });
  }

  applyFilter(): void {
    let filtered = this.orders;

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    if (this.fromDate) {
      const from = new Date(this.fromDate);
      filtered = filtered.filter(order => order.createdAt.toDate() >= from);
    }

    if (this.toDate) {
      const to = new Date(this.toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => order.createdAt.toDate() <= to);
    }

    this.filteredOrders = filtered;
  }
}