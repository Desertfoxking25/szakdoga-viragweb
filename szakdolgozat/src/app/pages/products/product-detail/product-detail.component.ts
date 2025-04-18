import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../shared/models/product.model';
import { ProductService } from '../../../shared/services/product.service';
import { CartService } from '../../../shared/services/cart.service';
import { Auth } from '@angular/fire/auth';


@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: false
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined = undefined;

  constructor(
    private route: ActivatedRoute, 
    private productService: ProductService,
    private cartService: CartService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(id).subscribe(product => {
        this.product = product;
      });
    }
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.productService.getProductBySlug(slug).subscribe(product => {
        this.product = product;
      });
    }
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