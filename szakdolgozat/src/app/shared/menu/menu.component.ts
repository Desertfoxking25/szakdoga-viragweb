import { Component, OnInit, inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  standalone: false
})
export class MenuComponent implements OnInit {
  isMenuOpen = false;
  isLoggedIn = false;
  isAdmin: boolean = false;
  isAdminChecked: boolean = false;
  private auth: Auth;
  searchTerm: string = '';
  suggestions: Product[] = [];

  constructor(private router: Router, private productService: ProductService, private route: ActivatedRoute, private userService: UserService) {
    this.auth = inject(Auth); 
    onAuthStateChanged(this.auth, (user) => {
      this.isLoggedIn = !!user;
    });
  }

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.isLoggedIn = true;
        this.userService.getUserProfile(user.uid).subscribe(userData => {
          this.isAdmin = userData?.admin === true;
          this.isAdminChecked = true; 
        });
      } else {
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.isAdminChecked = true;
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

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

  goToProduct(product: Product) {
    this.router.navigate(['/product', product.slug]);
    this.searchTerm = '';
    this.suggestions = [];
  }
}