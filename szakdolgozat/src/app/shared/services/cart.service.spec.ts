import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CartItem } from '../models/CartItem.model';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} }
      ]
    });

    service = TestBed.inject(CartService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getCart should return items if user cart exists', async () => {
    const mockItems: CartItem[] = [
      { productId: 'abc', quantity: 2 } as CartItem,
      { productId: 'xyz', quantity: 1 } as CartItem
    ];
    const spy = spyOn(service, 'getCart').and.resolveTo(mockItems);

    const result = await service.getCart('testUser');

    expect(spy).toHaveBeenCalledOnceWith('testUser');
    expect(result.length).toBe(2);
    expect(result[0].productId).toBe('abc');
    expect(result[1].quantity).toBe(1);
    expect(Array.isArray(result)).toBeTrue();
  });

  it('getCart should return empty array if no cart exists', async () => {
    const spy = spyOn(service, 'getCart').and.resolveTo([]);

    const result = await service.getCart('noUser');

    expect(spy).toHaveBeenCalledWith('noUser');
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('addToCart should add new item to cart', async () => {
    const item: CartItem = { productId: 'xyz', quantity: 1 } as CartItem;
    const spy = spyOn(service, 'addToCart').and.returnValue(Promise.resolve());

    await expectAsync(service.addToCart('user1', item)).toBeResolved();
    expect(spy).toHaveBeenCalledWith('user1', jasmine.objectContaining({
      productId: 'xyz',
      quantity: 1
    }));
  });

  it('removeFromCart should remove correct item from cart', async () => {
    const spy = spyOn(service, 'removeFromCart').and.returnValue(Promise.resolve());

    await expectAsync(service.removeFromCart('user1', 'xyz')).toBeResolved();
    expect(spy).toHaveBeenCalledWith('user1', 'xyz');
  });

  it('setQuantity should update item quantity correctly', async () => {
    const item: CartItem = { productId: 'xyz', quantity: 5 } as CartItem;
    const spy = spyOn(service, 'setQuantity').and.returnValue(Promise.resolve());

    await expectAsync(service.setQuantity('user1', item)).toBeResolved();
    expect(spy).toHaveBeenCalledWith('user1', jasmine.objectContaining({
      productId: 'xyz',
      quantity: 5
    }));
  });

  it('clearCart should empty the cart for the user', async () => {
    const spy = spyOn(service, 'clearCart').and.returnValue(Promise.resolve());

    await expectAsync(service.clearCart('user1')).toBeResolved();
    expect(spy).toHaveBeenCalledOnceWith('user1');
  });
});
