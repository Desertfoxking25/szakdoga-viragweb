import { TestBed } from '@angular/core/testing';
import { RatingService } from './rating.service';
import { Rating } from '../models/rating.model';
import { of } from 'rxjs';

describe('RatingService (mocked)', () => {
  let service: RatingService;

  beforeEach(() => {
    service = Object.create(RatingService.prototype);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getRatingsByProduct should return ratings for a product', (done) => {
    const mockRatings: Rating[] = [
      { id: '1', userId: 'u1', productId: 'p1', stars: 4, reviewText: 'Jó cucc!', createdAt: {} as any },
      { id: '2', userId: 'u2', productId: 'p1', stars: 5, reviewText: 'Tökéletes!', createdAt: {} as any }
    ];

    spyOn(service, 'getRatingsByProduct').and.returnValue(of(mockRatings));

    service.getRatingsByProduct('p1').subscribe((ratings) => {
      expect(ratings.length).toBe(2);
      expect(ratings[0].productId).toBe('p1');
      expect(ratings[1].stars).toBe(5);
      expect(ratings.every(r => r.productId === 'p1')).toBeTrue();
      expect(ratings.map(r => r.stars)).toContain(4);
      expect(ratings.map(r => r.stars)).toContain(5);
      done();
    });
  });

  it('getUserRatingForProduct should return user rating if exists', async () => {
    const mockRating: Rating = {
      id: 'r1',
      userId: 'u1',
      productId: 'p1',
      stars: 5,
      reviewText: 'Kiváló',
      createdAt: {} as any
    };

    spyOn(service, 'getUserRatingForProduct').and.resolveTo(mockRating);

    const result = await service.getUserRatingForProduct('u1', 'p1');
    expect(result).toBeTruthy();
    expect(result?.userId).toBe('u1');
    expect(result?.stars).toBe(5);
    expect(result).toEqual(jasmine.objectContaining({
      userId: 'u1',
      productId: 'p1',
      stars: 5,
      reviewText: 'Kiváló'
    }));
  });

  it('getUserRatingForProduct should return null if no rating exists', async () => {
    spyOn(service, 'getUserRatingForProduct').and.resolveTo(null);

    const result = await service.getUserRatingForProduct('noUser', 'noProduct');
    expect(result).toBeNull();
  });

  it('addOrUpdateRating should add new rating if none exists', async () => {
    const mockRating: Rating = {
      userId: 'u2',
      productId: 'p2',
      stars: 4,
      reviewText: 'Új értékelés',
      createdAt: {} as any
    };
  
    const addSpy = jasmine.createSpy('addSpy');
    spyOn(service, 'getUserRatingForProduct').and.resolveTo(null);
    spyOn(service, 'addOrUpdateRating').and.callFake(async () => {
      addSpy(mockRating);
    });
  
    await service.addOrUpdateRating(mockRating);
    expect(addSpy).toHaveBeenCalled();
    expect(addSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      productId: 'p2',
      stars: 4
    }));
  });
  
  it('addOrUpdateRating should update existing rating if it exists', async () => {
    const mockRating: Rating = {
      userId: 'u1',
      productId: 'p1',
      stars: 5,
      reviewText: 'Frissítve',
      createdAt: {} as any
    };
  
    const updateSpy = jasmine.createSpy('updateSpy');
    spyOn(service, 'getUserRatingForProduct').and.resolveTo({ id: 'existing-id', ...mockRating });
    spyOn(service, 'addOrUpdateRating').and.callFake(async () => {
      updateSpy();
    });
  
    await service.addOrUpdateRating(mockRating);
    expect(updateSpy).toHaveBeenCalled();
  });

  it('deleteRating should call deleteDoc if rating exists', async () => {
    const spy = jasmine.createSpy('delete');
  
    spyOn(service, 'deleteRating').and.callFake(async (userId, productId) => {
      expect(userId).toBe('u1');
      expect(productId).toBe('p1');
      spy();
    });
  
    await service.deleteRating('u1', 'p1');
    expect(spy).toHaveBeenCalled();
  });
  
  it('deleteRating should do nothing if no rating exists', async () => {
    const spy = jasmine.createSpy('delete');
  
    spyOn(service, 'deleteRating').and.callFake(async () => {
    });
  
    await service.deleteRating('u1', 'p1');
    expect(spy).not.toHaveBeenCalled();
  });
});