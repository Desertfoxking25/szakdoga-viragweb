import { Component } from '@angular/core';
import { browserSessionPersistence, setPersistence, getAuth } from 'firebase/auth';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

/**
 * A root komponens, amely inicializálja a Google Analytics route trackinget
 * és beállítja az auth session persistálását a böngésző munkamenetére.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false
})
export class AppComponent {
  /** Alkalmazás címe (jelenleg nincs közvetlen használatban) */
  title = 'szakdolgozat';

  /**
   * Konstruktor, amely:
   * - beköti a Google Analytics route figyelést,
   * - beállítja a Firebase Auth session alapú persistálását.
   * @param router Az Angular router szolgáltatás
   */
  constructor(private router: Router) {

    // Google Analytics oldalváltás esemény bekötése
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      gtag('config', 'G-RWFJ3QBQXQ', {
        page_path: event.urlAfterRedirects
      });
    });

    // Firebase Auth session persistencia beállítása (kijelentkezik böngésző bezárásakor)
    const auth = getAuth();
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        console.log('Session persistence enabled (kijelentkezés böngészőzáráskor)');
      })
      .catch((err) => console.error('Persistence error:', err));
  }
}