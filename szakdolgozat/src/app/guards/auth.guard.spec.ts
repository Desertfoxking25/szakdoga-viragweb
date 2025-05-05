import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { Firestore, docData, doc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerSpy: jasmine.SpyObj<Router>;
  let firestoreSpy: jasmine.SpyObj<Firestore>;
  let authMock: Partial<Auth>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    firestoreSpy = jasmine.createSpyObj('Firestore', ['dummy']);
    authMock = {};

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerSpy },
        { provide: Firestore, useValue: firestoreSpy },
        { provide: Auth, useValue: authMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should redirect to login if no user is logged in', async () => {
    Object.defineProperty(authMock, 'currentUser', {
      get: () => null
    });

    const route = {} as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect if user.uid is undefined', async () => {
    Object.defineProperty(authMock, 'currentUser', {
      get: () => ({})
    });
  
    const route = { data: { requiresAdmin: true } } as unknown as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);
  
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should allow access if user is logged in and no admin required', async () => {
    Object.defineProperty(authMock, 'currentUser', {
      get: () => ({ uid: 'user1' })
    });

    const route = { data: {} } as unknown as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);
    expect(result).toBeTrue();
  });

  it('should allow access to admin route if user is admin', async () => {
    Object.defineProperty(authMock, 'currentUser', {
      get: () => ({ uid: 'admin1' })
    });
  
    spyOn(guard, 'checkAdminAccess').and.resolveTo(true);
  
    const route = { data: { requiresAdmin: true } } as unknown as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);
  
    expect(result).toBeTrue();
  });

  it('should allow access to non-admin route even if user is admin', async () => {
    Object.defineProperty(authMock, 'currentUser', {
      get: () => ({ uid: 'admin2' })
    });
  
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);
  
    expect(result).toBeTrue();
  });

  it('should allow access if route.data is undefined and user is logged in', async () => {
    Object.defineProperty(authMock, 'currentUser', {
      get: () => ({ uid: 'user4' })
    });
  
    const route = {} as unknown as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);
  
    expect(result).toBeTrue();
  });

  it('should deny access to admin route if user is not admin', async () => {
    Object.defineProperty(authMock, 'currentUser', {
      get: () => ({ uid: 'user2' })
    });
  
    spyOn(guard, 'checkAdminAccess').and.resolveTo(false);
  
    const route = { data: { requiresAdmin: true } } as unknown as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);
  
    expect(result).toBeFalse();
  });

  it('should deny access if userData.admin is undefined', async () => {
    Object.defineProperty(authMock, 'currentUser', {
      get: () => ({ uid: 'userNoAdmin' })
    });
  
    spyOn(docData as any, 'apply').and.returnValue(of({}));
  
    const route = { data: { requiresAdmin: true } } as unknown as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);
  
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle Firestore error gracefully', async () => {
    Object.defineProperty(authMock, 'currentUser', {
      get: () => ({ uid: 'user3' })
    });

    spyOn(docData as any, 'apply').and.throwError('Firestore failure');

    const route = { data: { requiresAdmin: true } } as unknown as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should catch sync error from docData and redirect', async () => {
    Object.defineProperty(authMock, 'currentUser', {
      get: () => ({ uid: 'syncErrorUser' })
    });
  
    spyOn(docData as any, 'apply').and.callFake(() => {
      throw new Error('Synchronous Firestore error');
    });
  
    const route = { data: { requiresAdmin: true } } as unknown as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);
  
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});