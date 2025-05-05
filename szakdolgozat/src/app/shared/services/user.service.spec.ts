import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { BehaviorSubject, of } from 'rxjs';
import { UserProfile } from '../models/user.model';

describe('UserService (mocked)', () => {
  let service: UserService;

  beforeEach(() => {
    service = Object.create(UserService.prototype);
    (service as any).adminSubject = new BehaviorSubject<boolean>(false);
    service.admin$ = (service as any).adminSubject.asObservable();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getIsAdmin should return false by default', () => {
    expect(service.getIsAdmin()).toBeFalse();
  });

  it('setIsAdmin should set value to true', () => {
    service.setIsAdmin(true);
    expect(service.getIsAdmin()).toBeTrue();
  });

  it('admin$ observable should emit true after setIsAdmin(true)', (done) => {
    service.setIsAdmin(true);
    service.admin$.subscribe((isAdmin) => {
      expect(isAdmin).toBeTrue();
      done();
    });
  });

  it('admin$ should emit false, then true', (done) => {
    const emitted: boolean[] = [];
    service.admin$.subscribe((value) => {
      emitted.push(value);
      if (emitted.length === 2) {
        expect(emitted).toEqual([false, true]);
        done();
      }
    });
  
    service.setIsAdmin(true);
  });

  it('getUserById should return user data', (done) => {
    const mockUser = { uid: 'abc123', name: 'Teszt Elek' };

    spyOn(service, 'getUserById').and.returnValue(of(mockUser));

    service.getUserById('abc123').subscribe((user) => {
      expect(user.uid).toBe('abc123');
      expect(user.name).toContain('Teszt');
      expect(mockUser).toEqual(jasmine.objectContaining({
        uid: jasmine.any(String),
        name: jasmine.any(String)
      }));
      done();
    });
  });

  it('getUserProfile should return typed user profile', (done) => {
    const mockProfile: UserProfile = {
      uid: 'u1',
      firstname: 'Elek',
      lastname: 'Teszt',
      email: 'teszt@teszt.hu',
      phone: '123456',
      address: 'Szeged',
      avatarUrl: 'https://example.com/avatar.jpg',
      admin: false
    };

    spyOn(service, 'getUserProfile').and.returnValue(of(mockProfile));

    service.getUserProfile('u1').subscribe((profile) => {
      expect(profile.email).toContain('@');
      
      const fullName = `${profile.firstname} ${profile.lastname}`;
      expect(fullName.length).toBeGreaterThan(5);
      done();
    });
  });

  it('updateUserProfile should resolve successfully', async () => {
    const profile: UserProfile = {
      uid: 'u1',
      firstname: 'Módosítótt',
      lastname: 'User',
      email: 'modosit@test.com',
      phone: '123',
      address: 'Barcelona'
    };

    const spy = spyOn(service, 'updateUserProfile').and.returnValue(Promise.resolve());

    await expectAsync(service.updateUserProfile(profile)).toBeResolved();
    expect(spy).toHaveBeenCalledWith(profile);
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
      firstname: 'Módosítótt',
      address: jasmine.stringMatching(/barcelona/i)
    }));
  });

  it('createUserProfileIfMissing should create if profile does not exist', async () => {
    const profile: UserProfile = {
      uid: 'u2',
      firstname: 'Új',
      lastname: 'User',
      email: 'uj@test.com',
      address: 'Budapest'
    };

    const spy = spyOn(service, 'createUserProfileIfMissing').and.returnValue(Promise.resolve());

    await expectAsync(service.createUserProfileIfMissing(profile)).toBeResolved();
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
      email: 'uj@test.com'
    }));
  });

  it('createUserProfileIfMissing should throw if uid is missing', async () => {
    const invalidProfile: any = {
      firstname: 'Hiba',
      lastname: 'NincsUID',
      email: 'hiba@test.com'
    };
  
    spyOn(service, 'createUserProfileIfMissing').and.callFake(() => {
      throw new Error('Missing UID');
    });
  
    expect(() => service.createUserProfileIfMissing(invalidProfile)).toThrowError('Missing UID');
  });
});