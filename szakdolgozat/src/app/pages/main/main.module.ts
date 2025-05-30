import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main-routing.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    RouterModule,
    MainRoutingModule
  ]
})
export class MainModule {}
