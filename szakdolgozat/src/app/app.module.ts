import { AppRoutingModule } from "./app.routing.module";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { BrowserModule } from "@angular/platform-browser";
import { MainComponent } from "./pages/main/main.component";
import { FormsModule } from "@angular/forms";
import { LoginComponent } from "./pages/login/login.component";
import { RegisterComponent } from "./pages/register/register.component";
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from "../environments/environment";
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { MenuComponent } from "./shared/menu/menu.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { CommonModule } from "@angular/common";
import { ProductsComponent } from "./pages/products/products.component";
import { FilterPanelComponent } from "./pages/products/filter-panel/filter-panel.component";
import { registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { LOCALE_ID } from '@angular/core';
import { ProductDetailComponent } from "./pages/products/product-detail/product-detail.component";

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        LoginComponent,
        RegisterComponent,
        ProfileComponent,
        MenuComponent,
        ProductsComponent,
        FilterPanelComponent,
        ProductDetailComponent
    ],
    imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    CommonModule
],
    providers: [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore()),
        {provide: LOCALE_ID, useValue: 'hu-HU'}
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
registerLocaleData(localeHu);