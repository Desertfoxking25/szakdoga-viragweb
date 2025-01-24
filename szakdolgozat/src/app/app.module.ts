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

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        LoginComponent,
        RegisterComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule
    ],
    providers: [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore())
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}