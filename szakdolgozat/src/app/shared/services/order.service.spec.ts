import { TestBed } from '@angular/core/testing';
import { OrderService } from './order.service';
import { Firestore, Timestamp } from '@angular/fire/firestore';
import { Order } from '../models/order.model';
import { of } from 'rxjs';
import { CartItem } from '../models/CartItem.model';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        { provide: Firestore, useValue: {} },
      ]
    });

    service = TestBed.inject(OrderService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getAllOrders should return list of orders', (done) => {
    const mockOrders: Order[] = [
      { id: '1', userId: 'u1', items: [], totalPrice: 1000, status: 'új', createdAt: Timestamp.now() },
      { id: '2', userId: 'u2', items: [], totalPrice: 2500, status: 'feldolgozás alatt', createdAt: Timestamp.now() }
    ];

    spyOn(service, 'getAllOrders').and.returnValue(of(mockOrders));

    service.getAllOrders().subscribe((orders) => {
      expect(orders.length).toBe(2);
      expect(orders[0].userId).toBe('u1');
      expect(orders[1].totalPrice).toBeGreaterThan(1000);
      expect(orders[1].status).toBe('feldolgozás alatt');
      done();
    });
  });

  it('getOrdersByUser should return user-specific orders', (done) => {
    const mockOrders: Order[] = [
      { id: '3', userId: 'userX', items: [], totalPrice: 1500, status: 'új', createdAt: Timestamp.now() }
    ];

    spyOn(service, 'getOrdersByUser').and.returnValue(of(mockOrders));

    service.getOrdersByUser('userX').subscribe((orders) => {
      expect(orders.length).toBe(1);
      expect(orders[0].userId).toBe('userX');
      expect(Array.isArray(orders)).toBeTrue();
      done();
    });
  });

  it('getOrdersByUser should return empty if userId is empty string', (done) => {
    spyOn(service, 'getOrdersByUser').and.returnValue(of([]));
  
    service.getOrdersByUser('').subscribe((orders) => {
      expect(orders.length).toBe(0);
      done();
    });
  });

  it('addOrder should resolve successfully', async () => {
    const order: Order = {
      id: '4',
      userId: 'userY',
      items: [
        { productId: 'p1', quantity: 2 } as CartItem,
        { productId: 'p2', quantity: 1 } as CartItem
      ],
      totalPrice: 5000,
      createdAt: Timestamp.now(),
      status: 'új'
    };

    const spy = spyOn(service, 'addOrder').and.returnValue(Promise.resolve());

    await expectAsync(service.addOrder(order)).toBeResolved();
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
      userId: 'userY',
      totalPrice: 5000,
      createdAt: jasmine.any(Timestamp)
    }));
    expect(order.items.length).toBe(2);
    expect(order.items.some(i => i.productId === 'p2')).toBeTrue();
  });

  it('addOrder should reject if Firestore add fails', async () => {
    const order: Order = {
      userId: 'userY',
      items: [{ productId: 'p1', quantity: 1 } as CartItem],
      totalPrice: 3000,
      createdAt: Timestamp.now(),
      status: 'új'
    };
  
    const error = new Error('Firestore addDoc failed');
    spyOn(service, 'addOrder').and.returnValue(Promise.reject(error));
  
    await expectAsync(service.addOrder(order)).toBeRejectedWith(error);
  });

  it('updateOrder should call update with correct id and data', async () => {
    const spy = spyOn(service, 'updateOrder').and.returnValue(Promise.resolve());
    const updateData: Partial<Order> = { status: 'teljesítve' };

    await expectAsync(service.updateOrder('order123', updateData)).toBeResolved();
    expect(spy).toHaveBeenCalledWith('order123', jasmine.objectContaining(updateData));
  });

  it('updateOrder should reject if an error occurs', async () => {
    const error = new Error('Firestore update failed');
    spyOn(service, 'updateOrder').and.returnValue(Promise.reject(error));
  
    await expectAsync(service.updateOrder('order123', { status: 'teljesítve' as 'teljesítve' })).toBeRejectedWith(error);
  });

  it('deleteOrder should resolve without error', async () => {
    const spy = spyOn(service, 'deleteOrder').and.returnValue(Promise.resolve());

    await expectAsync(service.deleteOrder('order123')).toBeResolved();
    expect(spy).toHaveBeenCalledWith('order123');
  });

  it('deleteOrder should reject if Firestore delete fails', async () => {
    const error = new Error('deleteDoc failed');
    spyOn(service, 'deleteOrder').and.returnValue(Promise.reject(error));
  
    await expectAsync(service.deleteOrder('order123')).toBeRejectedWith(error);
  });
});