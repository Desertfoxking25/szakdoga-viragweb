import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { UserProfile } from '../../../shared/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss'],
  standalone: false
})
export class OrderModalComponent implements OnInit{
  @Input() total: number = 0;
  @Input() userId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ name: string; email: string; phone: string; address: string; save: boolean }>();

  name: string = '';
  email: string = '';
  phone: string = '';
  address: string = '';
  save: boolean = false;
  modalVisible = false;
  isClosing = false;

  constructor(private userService: UserService, private snackBar: MatSnackBar) {}

  
  ngOnInit(): void {
    if (this.userId) {
      this.userService.getUserProfile(this.userId).subscribe((profile: UserProfile) => {
        this.name = `${profile.firstname} ${profile.lastname}`;
        this.email = profile.email;
        this.phone = profile.phone || '';
        this.address = profile.address || '';
      });
    }
    setTimeout(() => {
      this.modalVisible = true;
    }, 10);
  }

  submitOrder(form: any) {
    if (form.invalid) {
      this.snackBar.open('⚠️ Kérlek tölts ki minden mezőt!', 'Bezárás', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-error']
      });
      return;
    }
    
    this.confirm.emit({
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      save: this.save
    });
  }

  closeWithAnimation() {
    this.modalVisible = false;
    setTimeout(() => this.close.emit(), 300);
  }
}