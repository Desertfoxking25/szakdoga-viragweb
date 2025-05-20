import { Component, OnInit, inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';

/**
 * Menü komponens, amely kezeli a navigációs menüt, overlay-t, admin/jogosultság figyelést,
 * keresést terméknévre, és kijelentkezést.
 */
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  standalone: false
})
export class MenuComponent implements OnInit {
   /** Menü nyitott állapota */
  isMenuOpen = false;

  /** Overlay láthatósága */
  overlayVisible = false;

  /** Be van-e jelentkezve a felhasználó */
  isLoggedIn = false;

  /** Admin jogosultság állapota */
  isAdmin: boolean = false;

  /** Megtörtént-e az admin jogosultság lekérése */
  isAdminChecked: boolean = false;

  /** Firebase Auth referencia */
  private auth: Auth;

  /** Keresősáv aktuális értéke */
  searchTerm: string = '';

  /** Találati javaslatok a kereséshez */
  suggestions: Product[] = [];
 
  /**
   * Konstruktor a szükséges szolgáltatások injectálásával.
   * @param router Angular Router a navigációhoz
   * @param productService Termékek lekérdezése kereséshez
   * @param route Aktivált útvonal a query paraméterekhez
   * @param userService Admin státusz figyelése
   */
  constructor(
    private router: Router, 
    private productService: ProductService, 
    private route: ActivatedRoute, 
    private userService: UserService
  ) {
    this.auth = inject(Auth); // AuthService injektálása új Angular módszerrel
    onAuthStateChanged(this.auth, (user) => {
      this.isLoggedIn = !!user;
    });
  }

  /**
   * Inicializáláskor beállítja az auth figyelést és az admin jogosultságot.
   */
  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user) => {
      this.isLoggedIn = !!user;
      this.isAdminChecked = true;
    });
  
    this.userService.admin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
    
    // Kattintás figyelése az oldalon kívülre
    document.addEventListener('click', (event) => {
      this.handleDocumentClick(event);
    });
  }

  /**
   * Kezeli a kattintásokat a dokumentumon, hogy bezárja a menüt vagy keresési javaslatokat.
   * @param event Az egérkattintás eseménye
   */
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    const clickedInsideMenuButton = target.closest('.menu-button');
    const clickedInsideDropdown = target.closest('.dropdown-menu');
    const clickedInsideSearchWrapper = target.closest('.search-wrapper');
  
    if (!clickedInsideMenuButton && !clickedInsideDropdown) {
      this.isMenuOpen = false;
    document.body.style.overflow = '';
    }

    if (!clickedInsideSearchWrapper) {
      this.suggestions = [];
    }
  }

  /**
   * Menü megnyitása vagy bezárása overlay-jel együtt.
   */
  toggleMenu() {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      document.body.style.overflow = '';
      
      setTimeout(() => {
        this.overlayVisible = false;
      }, 400);
    } else {
      this.isMenuOpen = true;
      this.overlayVisible = true;
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Menü bezárása külön hívásként (pl. navigáció után).
   */
  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = '';

    setTimeout(() => {
      this.overlayVisible = false;
    }, 400);
  }

  /**
   * Kijelentkezteti a felhasználót. Ha profiloldalon van, visszanavigál a főoldalra.
   * Egyébként frissíti az aktuális URL-t.
   */
  logout() {
    const currentUrl = this.router.url;

  this.auth.signOut().then(() => {
    if (currentUrl.startsWith('/profile')) {
      this.router.navigate(['/']);
    } else {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl(currentUrl);
      });
    }
  });
  }

  /**
   * Keresési javaslatok frissítése gépelés közben.
   */
  onSearchInput() {
    if (this.searchTerm.trim().length < 1) {
      this.suggestions = [];
      return;
    }
    this.productService.getProducts().subscribe(products => {
      const keyword = this.searchTerm.toLowerCase();
      this.suggestions = products.filter(p =>
        p.name.toLowerCase().includes(keyword)
      ).slice(0, 10);
    });
  }

  /**
   * Keresőmező fókuszba kerülésekor javaslatok frissítése.
   */
  onSearchFocus() {
    if (this.searchTerm.trim().length > 0) {
      this.productService.getProducts().subscribe(products => {
        const keyword = this.searchTerm.toLowerCase();
        this.suggestions = products.filter(p =>
          p.name.toLowerCase().includes(keyword)
        ).slice(0, 10);
      });
    }
  }
  
  /**
   * Keresés beküldése. A keresett kifejezést a query paraméterekhez adja.
   */
  onSearchSubmit() {
    if (this.searchTerm.trim().length > 0) {
      const currentParams = { ...this.route.snapshot.queryParams };
      const currentKeywords = currentParams['search']
        ? currentParams['search'].split(',').map((s: string) => s.trim().toLowerCase())
        : [];
  
      const newKeyword = this.searchTerm.trim().toLowerCase();
  
      if (!currentKeywords.includes(newKeyword)) {
        currentKeywords.push(newKeyword);
      }
  
      const updatedParams = {
        ...currentParams,
        search: currentKeywords.join(',')
      };
  
      this.router.navigate(['/products'], { queryParams: updatedParams });
      this.searchTerm = '';
      this.suggestions = [];
    }
  }

  /**
   * Termék kiválasztása keresési javaslatból → navigálás a termék oldalára.
   * @param product A kiválasztott termék
   */
  goToProduct(product: Product) {
    const slug = product.slug;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/products', slug]);
    });
    this.searchTerm = '';
    this.suggestions = [];
  }
}