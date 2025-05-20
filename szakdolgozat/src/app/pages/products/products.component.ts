import { Component, OnInit, ViewChild } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../shared/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { CartService } from '../../shared/services/cart.service';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';
import { MatSnackBar } from '@angular/material/snack-bar';

declare let gtag: Function;

/**
 * Webshop terméklista oldal.
 * Szűrést, keresést, lapozást, kosárba helyezést és Google Analytics eseményküldést kezel.
 */
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  standalone: false
})
export class ProductsComponent implements OnInit {
  /** Összes termék */
  products: Product[] = [];

  /** Szűrt terméklista a keresés/szűrés után */
  filteredProducts: Product[] = [];

  /** Aktív kategóriaszűrő a query paraméter alapján */
  categoryFilter: string | null = null;

  /** Csak akciós termékek megjelenítése */
  salesOnly: boolean = false;

  /** Csak kiemelt termékek megjelenítése */
  featuredOnly: boolean = false;

  /** Kosár visszajelzés animációhoz: melyik indexű termék lett hozzáadva */
  addedToCart: boolean[] = [];

  /** Keresési kulcsszavak */
  keywordList: string[] = [];

  /** Ár intervallum szűrő (min, max) */
  priceRange: [number, number] = [0, 20000];

  /** Képek betöltésének állapota minden terméknél */
  loadedImages: boolean[] = [];

  /** Filter panel komponens referencia (preset szűrőkhöz) */
  @ViewChild(FilterPanelComponent) filterPanel!: FilterPanelComponent;

  /** Lapméret (oldalanként megjelenő termékek száma) */
  pageSize = 8;

  /** Jelenlegi oldalszám */
  currentPage = 1;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Betölti az URL paraméterek alapján a szűrőket és termékeket.
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.categoryFilter = params['category'] || null;

      this.keywordList = [];
      if (params['search']) {
        this.keywordList = params['search'].split(',').map((s: string) => s.trim().toLowerCase());
      }

      this.productService.getProducts().subscribe(products => {
        this.products = products;
        this.applyFilters();
      });
    });

    // Útvonalalapú szűrés (pl. /discounts vagy /features)
    this.route.url.subscribe(url => {
      const isAkcio = url.some(segment => segment.path === 'discounts');
      this.salesOnly = isAkcio;

      const isUjdonsag = url.some(segment => segment.path === 'features');
      this.featuredOnly = isUjdonsag;
    });

    this.loadedImages = new Array(this.filteredProducts.length).fill(false);
  }

  /** Dinamikus oldalszám lista a lapozóhoz */
  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;

    if (total <= 3) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (this.currentPage === 1) {
      pages.push(1, 2);
    } else if (this.currentPage === total) {
      pages.push(total - 1, total);
    } else {
      pages.push(this.currentPage - 1, this.currentPage, this.currentPage + 1);
    }

    return pages;
  }

  /** Aktuális oldal termékei */
  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredProducts.slice(start, end);
  }

  /** Oldalak összesített száma a szűrt termékek alapján */
  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize);
  }

  /** Kép betöltésének figyelése */
  onImageLoad(index: number): void {
    this.loadedImages[index] = true;
  }

  /** Új keresési kulcsszó hozzáadása és szűrés alkalmazása */
  onKeywordChanged(keyword: string) {
    const k = keyword.trim().toLowerCase();
    if (k && !this.keywordList.includes(k)) {
      this.keywordList.push(k);
    }
    this.applyFilters();
  }

  /** Árintervallum változására történő szűrés */
  onPriceRangeChanged(range: [number, number]) {
    this.priceRange = range;
    this.applyFilters();
  }

  /**
   * Szűrők alkalmazása a teljes terméklistán.
   * Kategória, kulcsszó, akció, kiemelt és ár alapján.
   */
  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = this.categoryFilter
        ? product.category.some(cat => cat.toLowerCase().includes(this.categoryFilter!.toLowerCase()))
        : true;

      const matchesKeyword = this.keywordList.length > 0
        ? this.keywordList.some(k =>
            product.name.toLowerCase().includes(k) ||
            product.category.some(cat => cat.toLowerCase().includes(k))
          )
        : true;

      const matchesSales = this.salesOnly ? product.sales === true : true;
      const matchesFeatured = this.featuredOnly ? product.featured === true : true;

      const selectedPresets = this.filterPanel?.pricePresets?.filter(p => p.selected) || [];

      const matchesPrice = selectedPresets.length > 0
        ? selectedPresets.some(p => product.price >= p.min && product.price <= p.max)
        : product.price >= this.priceRange[0] && product.price <= this.priceRange[1];

      this.currentPage = 1;

      return matchesCategory && matchesKeyword && matchesSales && matchesFeatured && matchesPrice;
    });
  }

  /** Kategória szűrő törlése + query param frissítés */
  clearCategoryFilter() {
    this.categoryFilter = null;
    this.applyFilters();

    const queryParams: any = {};
    if (this.keywordList.length > 0) queryParams.search = this.keywordList.join(',');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  /** Árintervallum visszaállítása alapértelmezettre */
  resetPriceRange() {
    this.priceRange = [0, 20000];
    this.applyFilters();
  }

  /** Egy adott kulcsszó eltávolítása a keresési listából */
  removeKeyword(keyword: string) {
    this.keywordList = this.keywordList.filter(k => k !== keyword);
    this.applyFilters();

    const queryParams: any = {};
    if (this.categoryFilter) queryParams.category = this.categoryFilter;
    if (this.keywordList.length > 0) queryParams.search = this.keywordList.join(',');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  /**
   * Termék hozzáadása a kosárhoz.
   * Csak bejelentkezett felhasználóknak, animációval + Analytics eseménnyel.
   * @param product A kosárba helyezendő termék
   * @param index A termék indexe a megjelenített listában
   * @param event (opcionális) az esemény a gomb vizuális animációjához
   */
  async addToCart(product: Product, index: number, event?: MouseEvent) {
    const user = this.auth.currentUser;
    if (!user) {
      this.snackBar.open('❌ Kérlek, jelentkezz be a kosár használatához!', 'Bezárás', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-error']
      });
      return;
    }

    const item = {
      productId: product.id!,
      name: product.name,
      price: product.price,
      imgUrl: product.imgUrl,
      quantity: 1
    };

    await this.cartService.addToCart(user.uid, item);

    // Google Analytics esemény
    gtag('event', 'add_to_cart', {
      currency: 'HUF',
      value: product.price,
      items: [{
        item_name: product.name,
        item_id: product.id || product.slug,
        price: product.price,
        quantity: 1
      }]
    });

    this.addedToCart[index] = true;

    if (event) {
      const button = (event.target as HTMLElement);
      button.classList.add('added');
    }

    setTimeout(() => {
      this.addedToCart[index] = false;
      if (event) {
        const button = (event.target as HTMLElement);
        button.classList.remove('added');
      }
    }, 1500);
  }
}
