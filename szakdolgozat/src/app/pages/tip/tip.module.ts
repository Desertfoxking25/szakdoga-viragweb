import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipComponent } from './tip.component';
import { TipRoutingModule } from './tip-routing.module';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [TipComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    TipRoutingModule
  ]
})
export class TipModule {}