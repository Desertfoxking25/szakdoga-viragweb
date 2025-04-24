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


declare let gtag: Function;

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: false
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined = undefined;
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
    private auth: Auth
  ) {}

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

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

      this.ratingService.getRatingsByProduct(product.id!).subscribe((ratings: Rating[]) => {
        this.ratings = ratings;
        this.ratingCount = ratings.length;
        const total = ratings.reduce((sum, r) => sum + r.stars, 0);
        this.averageRating = total / (ratings.length || 1);

        ratings.forEach(rating => {
          if (!this.authorMap[rating.userId]) {
            this.userService.getUserProfile(rating.userId).subscribe(profile => {
              this.authorMap[rating.userId] = `${profile.lastname} ${profile.firstname}`;
            });
          }
        });
      });
    });
  }
  
  loadRatings(productId: string) {
    this.ratingService.getRatingsByProduct(productId).subscribe((ratings: any) => {
      this.ratings = ratings;
      this.ratingCount = ratings.length;

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
    alert('Értékelésed mentve!');
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