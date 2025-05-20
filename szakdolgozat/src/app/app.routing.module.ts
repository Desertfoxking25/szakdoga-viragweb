import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

/**
 * Az alkalmazás fő útvonalait definiáló konfiguráció.
 * Minden oldal külön modulként (lazy loaded) kerül betöltésre.
 */
const routes: Routes = [
  /**
   * Főoldal (main module), pl. hírek, kezdőlap, meccsek, stb.
   */
  { path: '', loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule) },

  /**
   * Admin felület útvonala (admin jogosultságot igényelhet).
   */
  { path: 'admin', loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule) },

  /**
   * Bejelentkezés / regisztráció oldal.
   */
  { path: 'authentication', loadChildren: () => import('./pages/authentication/authentication.module').then(m => m.AuthenticationModule) },

  /**
   * Kosár oldal, ahol a felhasználó megnézheti és módosíthatja a rendelését.
   */
  { path: 'cart', loadChildren: () => import('./pages/cart/cart.module').then(m => m.CartModule) },

  /**
   * GYIK oldal, felhasználók által is bővíthető.
   */
  { path: 'faq', loadChildren: () => import('./pages/faq/faq.module').then(m => m.FaqModule) },

  /**
   * Terméklista és termékoldalak (shop).
   */
  { path: 'products', loadChildren: () => import('./pages/products/products.module').then(m => m.ProductsModule) },

  /**
   * Profil oldal, bejelentkezett felhasználók számára.
   */
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule) },

  /**
   * Kertészeti tippek oldal, ahol a felhasználók ötleteket oszthatnak meg.
   */
  { path: 'tips', loadChildren: () => import('./pages/tip/tip.module').then(m => m.TipModule) },
];

/**
 * Az alkalmazás útvonalkezelő modulja.
 * Ez felelős az Angular router globális beállításáért.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)], // Az útvonalakat a root szinten regisztráljuk
  exports: [RouterModule]
})
export class AppRoutingModule {}
