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
      name: 'Évelők',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/evelok.png?alt=media&token=34942ab9-4a1e-44bb-a90f-6ff129d97add'
    },
    {
      name: 'Páfrányok',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/pafranyok.png?alt=media&token=9ed78e14-75cd-4b00-9936-c0abd76e29b3'
    },
    {
      name: 'Kaktuszok és pozsgások',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/kaktuszok.png?alt=media&token=3aa04f2b-05cc-4e8f-8b51-b0e47ecb1387'
    },
    {
      name: 'Gyümölcsfák és bokrok',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/gyulomcsfak.png?alt=media&token=c6e2b9b6-ba12-4707-94a9-ad6ca85bfa2b'
    },
    {
      name: 'Díszfák',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/diszfak.png?alt=media&token=19c7caa5-5bee-442e-a87a-0b61122f46cd'
    },
    {
      name: 'Balkonnövények',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/balkonnyovenyek.png?alt=media&token=fafc3919-c998-4cee-84cd-e2d3bf2f1996'
    },
    {
      name: 'Szobanövények',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/szobanovenyek.png?alt=media&token=5faf6264-d615-41ce-b34b-ea47e9285832'
    },
    {
      name: 'Fűszernövények',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/flowershop-szakdoga.firebasestorage.app/o/fuszernovenyek.png?alt=media&token=8a28418e-8987-421b-927a-66e062b63ae7'
    }
  ];
  loadedImages: boolean[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadedImages = new Array(this.categories.length).fill(false);
  }

  onImageLoad(index: number): void {
    this.loadedImages[index] = true;
  }
}