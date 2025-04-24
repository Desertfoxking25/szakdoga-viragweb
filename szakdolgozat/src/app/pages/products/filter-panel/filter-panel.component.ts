import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
  standalone: false
})
export class FilterPanelComponent {
  @Input() categoryFilter: string | null = null;
  @Input() keywordList: string[] = [];
  @Input() priceRange: [number, number] = [0, 30000];

  @Output() priceRangeChanged = new EventEmitter<[number, number]>();
  @Output() removeCategoryFilter = new EventEmitter<void>();
  @Output() removeKeywordFilter = new EventEmitter<string>();
  @Output() resetPriceFilter = new EventEmitter<void>();

  searchInput: string = '';

  onPriceChange(min: number, max: number) {
    if (min > max) {
      max = min;
    }
    this.priceRange = [min, max];
    this.priceRangeChanged.emit(this.priceRange);
  }
}