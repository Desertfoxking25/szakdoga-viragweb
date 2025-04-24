import { Component } from '@angular/core';
import { browserSessionPersistence, setPersistence, getAuth } from 'firebase/auth';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false
})
export class AppComponent {
  title = 'szakdolgozat';
  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      gtag('config', 'G-RWFJ3QBQXQ', {
        page_path: event.urlAfterRedirects
      });
    });

    const auth = getAuth();
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        console.log('Session persistence enabled (kijelentkezés böngészőzáráskor)');
      })
      .catch((err) => console.error('Persistence error:', err));
  }
}