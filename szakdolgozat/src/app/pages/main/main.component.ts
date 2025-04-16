import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: false
})
export class MainComponent implements OnInit {
  categories = [
    {
      name: 'Szobanövények',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/szobanovenyek.png?alt=media&token=5faf6264-d615-41ce-b34b-ea47e9285832'
    },
    {
      name: 'Trópusi',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/tropusi.png?alt=media&token=3f7eaf9c-ba2d-4b3a-b0b6-8512a69227fe'
    },
    {
      name: 'Könnyen gondozható növények',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/konnyengond.png?alt=media&token=18f7448f-4878-4309-af90-f1113ba0ed5d'
    },
    {
      name: 'Fűszernövények',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/fuszernovenyek.png?alt=media&token=8a28418e-8987-421b-927a-66e062b63ae7'
    }
  ];

  ngOnInit(): void {}
}