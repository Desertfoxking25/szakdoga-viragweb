import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainComponent } from "./pages/main/main.component";
import { LoginComponent } from "./pages/login/login.component";
import { RegisterComponent } from "./pages/register/register.component";
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from "./pages/profile/profile.component";
import { ProductsComponent } from "./pages/products/products.component";
import { ProductDetailComponent } from "./pages/products/product-detail/product-detail.component";

const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'products', component: ProductsComponent },
    { path: 'product/:slug', component: ProductDetailComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {}