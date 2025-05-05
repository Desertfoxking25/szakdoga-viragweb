import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

describe('AuthService', () => {
  let service: AuthService;
  let afAuthSpy: jasmine.SpyObj<AngularFireAuth>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AngularFireAuth', [
      'createUserWithEmailAndPassword',
      'signInWithEmailAndPassword',
      'signOut'
    ]);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AngularFireAuth, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    afAuthSpy = TestBed.inject(AngularFireAuth) as jasmine.SpyObj<AngularFireAuth>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('register should call createUserWithEmailAndPassword', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    afAuthSpy.createUserWithEmailAndPassword.and.resolveTo({ user: {} } as any);

    const result = await service.register(email, password);
    expect(afAuthSpy.createUserWithEmailAndPassword).toHaveBeenCalledWith(email, password);
    expect(result.user).toBeDefined();
  });

  it('register should reject on error', async () => {
    afAuthSpy.createUserWithEmailAndPassword.and.rejectWith(new Error('Registration failed'));

    await expectAsync(service.register('a@b.com', 'badpass')).toBeRejectedWithError('Registration failed');
  });

  it('register should not call signOut', async () => {
    afAuthSpy.createUserWithEmailAndPassword.and.resolveTo({ user: {} } as any);
    await service.register('x@y.com', 'valami123');
    expect(afAuthSpy.signOut).not.toHaveBeenCalled();
  });

  it('login should call signInWithEmailAndPassword', async () => {
    const email = 'login@test.com';
    const password = 'securePass';
    afAuthSpy.signInWithEmailAndPassword.and.resolveTo({ user: {} } as any);

    const result = await service.login(email, password);
    expect(afAuthSpy.signInWithEmailAndPassword).toHaveBeenCalledWith(email, password);
    expect(result.user).toBeDefined();
  });

  it('login should reject on invalid credentials', async () => {
    afAuthSpy.signInWithEmailAndPassword.and.rejectWith(new Error('Invalid credentials'));

    await expectAsync(service.login('wrong@mail.com', 'wrong')).toBeRejectedWithError('Invalid credentials');
  });

  it('logout should call signOut', async () => {
    afAuthSpy.signOut.and.resolveTo();

    await expectAsync(service.logout()).toBeResolved();
    expect(afAuthSpy.signOut).toHaveBeenCalled();
  });

  it('logout should reject if signOut fails', async () => {
    afAuthSpy.signOut.and.rejectWith(new Error('Logout failed'));
  
    await expectAsync(service.logout()).toBeRejectedWithError('Logout failed');
  });
});