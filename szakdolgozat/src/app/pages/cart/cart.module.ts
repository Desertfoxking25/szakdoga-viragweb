import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './cart.component';
import { CartRoutingModule } from './cart-routing.module';
import { FormsModule } from '@angular/forms';
import { OrderModalComponent } from './order-modal/order-modal.component';

@NgModule({
  declarations: [
    CartComponent, 
    OrderModalComponent 
  ],
  imports: [
    CommonModule,
    FormsModule,
    CartRoutingModule
  ]
})
export class CartModule {}