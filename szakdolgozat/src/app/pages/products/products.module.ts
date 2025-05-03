import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './products.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';
import { ProductsRoutingModule } from './products-routing.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    ProductsComponent,
    ProductDetailComponent,
    FilterPanelComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatSnackBarModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule {}
