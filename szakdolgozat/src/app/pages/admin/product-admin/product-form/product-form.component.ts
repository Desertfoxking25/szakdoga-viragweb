import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../../../shared/models/product.model';
import { ProductService } from '../../../../shared/services/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  standalone: false
})
export class ProductFormComponent {
  categoryString: string = '';
  product: Product = {
    name: '',
    description: '',
    price: 0,
    category: [],
    imgUrl: '',
    sales: false,
    featured: false,
    slug: ''
  };

  constructor(
    private dialogRef: MatDialogRef<ProductFormComponent>,
    private productService: ProductService,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', product?: Product }
  ) {
    if (data.mode === 'edit' && data.product) {
      this.product = { ...data.product };
      this.categoryString = this.product.category.join(', ');
    }
  }

  save(): void {
    this.product.category = this.categoryString
    .split(',')
    .map((c: string) => c.trim())
    .filter((c: string) => c.length > 0);

    if (this.data.mode === 'create') {
      this.productService.createProduct(this.product).then(() => {
        this.dialogRef.close('refresh');
      });
    } else {
      this.productService.updateProduct(this.product.id!, this.product).then(() => {
        this.dialogRef.close('refresh');
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}