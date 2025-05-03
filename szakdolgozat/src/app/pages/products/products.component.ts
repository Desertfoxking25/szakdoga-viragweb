import { Component, OnInit, ViewChild } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../shared/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { CartService } from '../../shared/services/cart.service';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';
import { MatSnackBar } from '@angular/material/snack-bar';

declare let gtag: Function;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  standalone: false
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categoryFilter: string | null = null;
  salesOnly: boolean = false;
  featuredOnly: boolean = false;
  addedToCart: boolean[] = [];
  keywordList: string[] = [];
  priceRange: [number, number] = [0, 20000];
  loadedImages: boolean[] = [];
  @ViewChild(FilterPanelComponent) filterPanel!: FilterPanelComponent;
  pageSize = 8;
  currentPage = 1;

  constructor(
    private productService: ProductService, 
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {}

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

    this.route.url.subscribe(url => {
      const isAkcio = url.some(segment => segment.path === 'discounts');
      this.salesOnly = isAkcio;

      const isUjdonsag = url.some(segment => segment.path === 'features');
      this.featuredOnly = isUjdonsag;
    });
    this.loadedImages = new Array(this.filteredProducts.length).fill(false);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
  
    if (total <= 3) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else if (this.currentPage === 1) {
      pages.push(1, 2);
    } else if (this.currentPage === total) {
      pages.push(total - 1, total);
    } else {
      pages.push(this.currentPage - 1, this.currentPage, this.currentPage + 1);
    }
  
    return pages;
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredProducts.slice(start, end);
  }
  
  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize);
  }

  onImageLoad(index: number): void {
    this.loadedImages[index] = true;
  }

  onKeywordChanged(keyword: string) {
    const k = keyword.trim().toLowerCase();
    if (k && !this.keywordList.includes(k)) {
      this.keywordList.push(k);
    }
    this.applyFilters();
  }

  onPriceRangeChanged(range: [number, number]) {
    this.priceRange = range;
    this.applyFilters();
  }

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

      const selectedPricePresets = this.filterPanel?.pricePresets?.filter(p => p.selected) || [];

      const matchesPrice = selectedPricePresets.length > 0
        ? selectedPricePresets.some(p => product.price >= p.min && product.price <= p.max)
        : product.price >= this.priceRange[0] && product.price <= this.priceRange[1];
      
      this.currentPage = 1;

      return matchesCategory && matchesKeyword && matchesSales && matchesFeatured && matchesPrice;
    });
  }

  clearCategoryFilter() {
    this.categoryFilter = null;
    this.applyFilters();

    const queryParams: any = {};
    if (this.keywordList.length > 0) queryParams.search = this.keywordList.join(',');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true,
    });
  }

  resetPriceRange() {
    this.priceRange = [0, 20000];
    this.applyFilters();
  }

  removeKeyword(keyword: string) {
    this.keywordList = this.keywordList.filter(k => k !== keyword);
  this.applyFilters();

  const queryParams: any = {};
  if (this.categoryFilter) queryParams.category = this.categoryFilter;
  if (this.keywordList.length > 0) queryParams.search = this.keywordList.join(',');

  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: queryParams,
    replaceUrl: true,
  });
  }

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