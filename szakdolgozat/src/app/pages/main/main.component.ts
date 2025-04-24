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
      name: 'Könnyen gondozható',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/konnyengond.png?alt=media&token=18f7448f-4878-4309-af90-f1113ba0ed5d'
    },
    {
      name: 'Fűszernövények',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/fuszernovenyek.png?alt=media&token=8a28418e-8987-421b-927a-66e062b63ae7'
    },
    {
      name: 'Tavaszi ültetésű',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/tavasziviragok.png?alt=media&token=500da55d-d251-41f8-b977-fbf684fbb182'
    },
    {
      name: 'Virágok',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/viragok.png?alt=media&token=fbe5e22c-ee70-4890-92de-c4551bd73ffa'
    },
    {
      name: 'Őszi ültetésű',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/%C3%B6sziviragok.png?alt=media&token=66b5d2f6-6bfe-4bc4-8b44-e2cf698d99e6'
    }
  ];

  ngOnInit(): void {}
}