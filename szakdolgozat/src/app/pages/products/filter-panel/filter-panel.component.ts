import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
  standalone: false
})
export class FilterPanelComponent {
  @Output() keywordChanged = new EventEmitter<string>();
  @Output() priceRangeChanged = new EventEmitter<[number, number]>();

  keyword: string = '';
  priceRange: [number, number] = [0, 10000];

  onKeywordInput() {
    this.keywordChanged.emit(this.keyword);
  }

  onPriceChange(min: number, max: number) {
    if (min > max) {
      max = min;
    }
    this.priceRange = [min, max];
    this.priceRangeChanged.emit(this.priceRange);
  }
}