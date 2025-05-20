import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * Termékszűrő panel, amely:
 * - kezeli a kategória, kulcsszó és ár szűrőket,
 * - emitálja a változásokat a szülő komponens felé,
 * - lehetőséget ad slider vagy előre definiált árintervallum választására.
 */
@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
  standalone: false
})
export class FilterPanelComponent {
  /**
   * Aktuálisan kiválasztott kategóriaszűrő.
   */
  @Input() categoryFilter: string | null = null;

  /**
   * Keresési kulcsszavak listája.
   */
  @Input() keywordList: string[] = [];

  /**
   * Aktuális árintervallum, [minimum, maximum] Ft.
   */
  @Input() priceRange: [number, number] = [0, 20000];

  /**
   * Esemény, ha változik az árintervallum.
   */
  @Output() priceRangeChanged = new EventEmitter<[number, number]>();

  /**
   * Esemény, ha a kategóriaszűrőt eltávolítják.
   */
  @Output() removeCategoryFilter = new EventEmitter<void>();

  /**
   * Esemény, ha egy keresési kulcsszót eltávolítanak.
   */
  @Output() removeKeywordFilter = new EventEmitter<string>();

  /**
   * Esemény, ha az ár szűrőt alaphelyzetbe állítják.
   */
  @Output() resetPriceFilter = new EventEmitter<void>();

  /** Keresési mező inputja (nem funkcionális itt, de UI-hoz tartozhat) */
  searchInput: string = '';

  /** Ár előbeállítások checkbox listája */
  pricePresets: { label: string; min: number; max: number; selected: boolean }[] = [
    { label: '0–2000 Ft', min: 0, max: 2000, selected: false },
    { label: '2000–5000 Ft', min: 2000, max: 5000, selected: false },
    { label: '5000–10000 Ft', min: 5000, max: 10000, selected: false },
    { label: '10000–20000 Ft', min: 10000, max: 20000, selected: false }
  ];

  /**
   * Sliderrel beállított árintervallum módosítása.
   * @param min Alsó határ
   * @param max Felső határ
   */
  onPriceChange(min: number, max: number) {
    if (min > max) {
      max = min;
    }
    this.priceRange = [min, max];
    this.priceRangeChanged.emit(this.priceRange);
  }

  /**
   * Checkbox változása esetén frissíti a kiválasztott árpreseteket.
   * @param event Checkbox esemény
   * @param index Az árpreset indexe
   */
  onCheckboxChange(event: Event, index: number) {
    const checkbox = event.target as HTMLInputElement;
    this.onPricePresetChange(index, checkbox.checked);
  }

  /**
   * Ár preset kiválasztásának logikája: új árintervallum számítása.
   * @param index Kiválasztott preset indexe
   * @param checked Ki van-e jelölve
   */
  onPricePresetChange(index: number, checked: boolean) {
    this.pricePresets[index].selected = checked;

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

  /**
   * Egy adott preset törlése a kiválasztottak közül.
   * @param index Az eltávolítandó preset indexe
   */
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

  /**
   * Akkor igaz, ha a sliderrel beállított ár eltér az alapértelmezettől,
   * és nincs kiválasztva semmilyen preset.
   */
  get isSliderPriceActive(): boolean {
    return (this.priceRange[0] > 0 || this.priceRange[1] < 20000) &&
           this.pricePresets.every(p => !p.selected);
  }
}
