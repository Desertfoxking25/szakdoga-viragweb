import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationComponent } from './authentication.component';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { Firestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Auth } from '@angular/fire/auth';

describe('AuthenticationComponent', () => {
  let component: AuthenticationComponent;
  let fixture: ComponentFixture<AuthenticationComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let signInWithEmailAndPasswordMock: jasmine.Spy;
  
  beforeEach(async () => {
    signInWithEmailAndPasswordMock = jasmine.createSpy('signInWithEmailAndPassword').and.callFake((_auth, email, password) => {
      return Promise.resolve({ user: { uid: 'user123' } });
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUserById', 'setIsAdmin']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    (window as any).gtag = jasmine.createSpy('gtag');

    const mockAuth: Partial<Auth> = {
      app: {
        name: '[DEFAULT]',
        options: { projectId: 'demo' },
        automaticDataCollectionEnabled: false
      } as any
    };

    await TestBed.configureTestingModule({
      declarations: [AuthenticationComponent],
      imports: [FormsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Firestore, useValue: {} },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Auth, useValue: mockAuth }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should show snackbar if email or password missing on login', () => {
    component.email = '';
    component.password = '';
    component.login();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      '⚠️ Kérlek, add meg az e-mail címet és a jelszót!',
      'Bezárás',
      jasmine.any(Object)
    );
  });
});