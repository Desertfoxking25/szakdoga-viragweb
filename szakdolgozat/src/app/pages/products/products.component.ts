import { Component, OnInit } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../shared/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { CartService } from '../../shared/services/cart.service';


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

  keywordList: string[] = [];
  priceRange: [number, number] = [0, 30000];

  constructor(
    private productService: ProductService, 
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private auth: Auth
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
      const matchesPrice = product.price >= this.priceRange[0] && product.price <= this.priceRange[1];

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
    this.priceRange = [0, 30000];
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

  async addToCart(product: Product) {
    const user = this.auth.currentUser;
    if (!user) {
      alert('Kérlek, jelentkezz be a kosár használatához!');
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
    alert('Termék hozzáadva a kosárhoz!');
  }
}