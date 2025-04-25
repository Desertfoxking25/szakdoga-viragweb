import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../shared/services/product.service';
import { Product } from '../../../shared/models/product.model';
import { MatDialog } from '@angular/material/dialog';
import { ProductFormComponent } from './product-form/product-form.component';

@Component({
  selector: 'app-product-admin',
  templateUrl: './product-admin.component.html',
  styleUrls: ['./product-admin.component.scss'],
  standalone: false
})
export class ProductAdminComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  displayedColumns: string[] = ['img', 'name', 'price', 'category', 'sales', 'featured', 'slug', 'description', 'actions'];


  constructor(
    private productService: ProductService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((res) => {
      this.products = res;
      this.filteredProducts = res;
    });
  }

  filterProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(term)
    );
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadProducts();
      }
    });
  }

  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      data: {
        mode: 'edit',
        product: product
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadProducts();
      }
    });
  }

  deleteProduct(productId: string): void {
    if (confirm('Biztosan törlöd ezt a terméket?')) {
      this.productService.deleteProduct(productId).then(() => {
        this.loadProducts();
      }).catch((error) => {
        console.error('Hiba történt a törlés során:', error);
      });
    }
  }
}