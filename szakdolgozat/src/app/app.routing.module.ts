import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
    { path: '', loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule) },
    { path: 'admin', loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule)},
    { path: 'authentication', loadChildren: () => import('./pages/authentication/authentication.module').then(m => m.AuthenticationModule) },
    { path: 'cart', loadChildren: () => import('./pages/cart/cart.module').then(m => m.CartModule) },
    { path: 'faq', loadChildren: () => import('./pages/faq/faq.module').then(m => m.FaqModule) },
    { path: 'products', loadChildren: () => import('./pages/products/products.module').then(m => m.ProductsModule) },
    { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule) },
    { path: 'tips', loadChildren: () => import('./pages/tip/tip.module').then(m => m.TipModule) },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {}