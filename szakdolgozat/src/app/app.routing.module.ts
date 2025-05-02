import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainComponent } from "./pages/main/main.component";
import { AuthenticationComponent } from "./pages/authentication/authentication.component";
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from "./pages/profile/profile.component";
import { ProductsComponent } from "./pages/products/products.component";
import { ProductDetailComponent } from "./pages/products/product-detail/product-detail.component";
import { CartComponent } from "./pages/cart/cart.component";
import { FaqComponent } from "./pages/faq/faq.component";
import { TipComponent } from "./pages/tip/tip.component";
import { ProfileEditComponent } from "./pages/profile/profile-edit/profile-edit.component";

const routes: Routes = [
    {
      path: 'admin',
      loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule)
    },
    { path: '', component: MainComponent },
    { path: 'authentication', component: AuthenticationComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'profile/edit', component: ProfileEditComponent, canActivate: [AuthGuard] },
    { path: 'products', component: ProductsComponent },
    { path: 'product/:slug', component: ProductDetailComponent },
    { path: 'products/discounts', component: ProductsComponent },
    { path: 'products/features', component: ProductsComponent },
    { path: 'cart', component: CartComponent},
    { path: 'faq', component: FaqComponent },
    { path: 'tips', component: TipComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {}