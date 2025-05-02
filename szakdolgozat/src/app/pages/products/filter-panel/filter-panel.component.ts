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
  @Input() priceRange: [number, number] = [0, 20000];

  @Output() priceRangeChanged = new EventEmitter<[number, number]>();
  @Output() removeCategoryFilter = new EventEmitter<void>();
  @Output() removeKeywordFilter = new EventEmitter<string>();
  @Output() resetPriceFilter = new EventEmitter<void>();

  searchInput: string = '';
  pricePresets: { label: string; min: number; max: number; selected: boolean }[] = [
    { label: '0–2000 Ft', min: 0, max: 2000, selected: false },
    { label: '2000–5000 Ft', min: 2000, max: 5000, selected: false },
    { label: '5000–10000 Ft', min: 5000, max: 10000, selected: false },
    { label: '10000–20000 Ft', min: 10000, max: 20000, selected: false }
  ];

  onPriceChange(min: number, max: number) {
    if (min > max) {
      max = min;
    }
    this.priceRange = [min, max];
    this.priceRangeChanged.emit(this.priceRange);
  }

  onCheckboxChange(event: Event, index: number) {
    const checkbox = event.target as HTMLInputElement;
    this.onPricePresetChange(index, checkbox.checked);
  }

  onPricePresetChange(index: number, checked: boolean) {
    this.pricePresets[index].selected = checked;
  
    const selectedPresets = this.pricePresets.filter(p => p.selected);
  
    if (selectedPresets.length > 0) {
      const min = Math.min(...selectedPresets.map(p => p.min));
      const max = Math.max(...selectedPresets.map(p => p.max));
      this.priceRange = [min, max];
      this.priceRangeChanged.emit(this.priceRange);
    } else {
      this.priceRange = [0, 20000];
      this.priceRangeChanged.emit(this.priceRange);
    }
  }

  removePricePreset(index: number) {
    this.pricePresets[index].selected = false;
  
    const selectedPresets = this.pricePresets.filter(p => p.selected);
    if (selectedPresets.length > 0) {
      const min = Math.min(...selectedPresets.map(p => p.min));
      const max = Math.max(...selectedPresets.map(p => p.max));
      this.priceRange = [min, max];
    } else {
      this.priceRange = [0, 20000];
    }
  
    this.priceRangeChanged.emit(this.priceRange);
  }

  get isSliderPriceActive(): boolean {
    return (this.priceRange[0] > 0 || this.priceRange[1] < 20000) && this.pricePresets.every(p => !p.selected);
  }
}