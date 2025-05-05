import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipComponent } from './tip.component';
import { TipRoutingModule } from './tip-routing.module';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TipAssistantComponent } from './tip-assistant/tip-assistant.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [TipComponent, TipAssistantComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    TipRoutingModule,
    HttpClientModule
  ]
})
export class TipModule {}