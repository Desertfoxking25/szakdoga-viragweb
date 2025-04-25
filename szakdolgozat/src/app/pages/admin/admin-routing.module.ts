import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductAdminComponent } from './product-admin/product-admin.component';
import { AuthGuard } from '../../guards/auth.guard';
import { OrdersAdminComponent } from './orders-admin/orders-admin.component';

const routes: Routes = [
  { path: 'products', 
    component: ProductAdminComponent,
    canActivate: [AuthGuard],
    data: { requiresAdmin: true }
  },
  {
    path: 'orders',
    component: OrdersAdminComponent,
    canActivate: [AuthGuard],
    data: { requiresAdmin: true }
  },
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
