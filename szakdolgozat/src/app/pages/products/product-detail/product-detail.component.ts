import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../shared/models/product.model';
import { ProductService } from '../../../shared/services/product.service';
import { CartService } from '../../../shared/services/cart.service';
import { RatingService } from '../../../shared/services/rating.service';
import { Rating } from '../../../shared/models/rating.model';
import { UserService } from '../../../shared/services/user.service';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from 'firebase/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';


declare let gtag: Function;

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: false
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined = undefined;
  quantity: number = 1;
  userId: string | null = null;
  userRating: number | null = null;
  userReviewText: string = '';
  averageRating: number = 0;
  ratingCount: number = 0;
  ratings: Rating[] = [];
  authorMap: { [uid: string]: string } = {};
  hoveredRating: number = 0;
  Math = Math;

  constructor(
    private route: ActivatedRoute, 
    private productService: ProductService,
    private cartService: CartService,
    private ratingService: RatingService,
    private userService: UserService,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  private async loadProduct(slug: string) {
    this.productService.getProductBySlug(slug).subscribe(async product => {
      if (!product) return;
  
      this.product = product;
  
      gtag('event', 'view_item', {
        currency: 'HUF',
        value: product.price,
        items: [{
          item_name: product.name,
          item_id: product.id || product.slug,
          price: product.price
        }]
      });
  
      const user = this.auth.currentUser;
      if (user) {
        this.userId = user.uid;
        const existing = await this.ratingService.getUserRatingForProduct(user.uid, product.id!);
        if (existing) {
          this.userRating = existing.stars;
          this.userReviewText = existing.reviewText || '';
        }
      }
  
      this.loadRatings(product.id!);
    });
  }
  
  loadRatings(productId: string) {
    this.ratingService.getRatingsByProduct(productId).subscribe((ratings: Rating[]) => {
      this.ratingCount = ratings.length;
      this.ratings = ratings
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        .slice(0, 3);
      const total = ratings.reduce((sum: number, r: Rating) => sum + r.stars, 0);
      this.averageRating = total / (ratings.length || 1);

      ratings.forEach((rating: Rating) => {
        if (!this.authorMap[rating.userId]) {
          this.userService.getUserProfile(rating.userId).subscribe(profile => {
            this.authorMap[rating.userId] = `${profile.firstname} ${profile.lastname}`;
          });
        }
      });
    });
  }

  setUserRating(rating: number) {
    this.userRating = rating;
  }

  async submitRating() {
    if (!this.product || !this.userId || !this.userRating) return;

    await this.ratingService.addOrUpdateRating({
      productId: this.product.id!,
      userId: this.userId,
      stars: this.userRating,
      reviewText: this.userReviewText,
      createdAt: Timestamp.now()
    });

    this.userReviewText = '';
    this.loadRatings(this.product.id!);
    
    this.snackBar.open('Értékelésed mentve!', 'Bezárás', {
      duration: 3000, 
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });
  }

  async deleteRating() {
    if (!this.userId || !this.product?.id) return;

    const confirmed = confirm('Biztosan törölni szeretnéd az értékelésed?');
    if (!confirmed) return;
  
    await this.ratingService.deleteRating(this.userId, this.product.id);
  
    this.userRating = null;
    this.userReviewText = '';
    this.loadRatings(this.product.id);
  
    this.snackBar.open('Értékelés törölve.', 'Bezárás', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });
  }

  async addToCart(product: Product) {
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
      quantity: this.quantity
    };
  
    await this.cartService.addToCart(user.uid, item);

    this.snackBar.open('✅ Termék hozzáadva a kosárhoz!', 'Bezárás', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });

    this.quantity = 1;
  }

  increaseQuantity() {
    this.quantity++;
  }
  
  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}