import { Component, OnInit } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../shared/services/product.service';
import { ActivatedRoute } from '@angular/router';
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
  

  keyword: string = '';
  priceRange: [number, number] = [0, 10000];

  constructor(
    private productService: ProductService, 
    private route: ActivatedRoute,
    private cartService: CartService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.categoryFilter = params['category'] || null;
      this.keyword = (params['search'] || '').toLowerCase();
  
      this.productService.getProducts().subscribe(products => {
        this.products = products;
        this.applyFilters();
      });
    });
  }

  onKeywordChanged(keyword: string) {
    this.keyword = keyword.toLowerCase();
    this.applyFilters();
  }

  onPriceRangeChanged(range: [number, number]) {
    this.priceRange = range;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = this.categoryFilter
        ? product.category.includes(this.categoryFilter!)
        : true;
  
      const matchesKeyword = this.keyword
        ? product.name.toLowerCase().includes(this.keyword) ||
          product.category.some(cat => cat.toLowerCase().includes(this.keyword))
        : true;
  
      return matchesCategory || matchesKeyword;
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