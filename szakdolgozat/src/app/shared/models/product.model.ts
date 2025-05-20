/**
 * Egy webshopban szereplő termék adatszerkezete.
 * Minden termék egy Firestore dokumentumként kerül eltárolásra a `products` kollekcióban.
 */
export interface Product {
  /**
   * A termék Firestore dokumentumazonosítója.
   * Csak lekérdezéskor van jelen (`idField` segítségével).
   */
  id?: string;

  /**
   * A termék megnevezése, amely a felületen megjelenik.
   */
  name: string;

  /**
   * Részletes leírás a termékről.
   */
  description: string;

  /**
   * A termék ára forintban.
   */
  price: number;

  /**
   * A termékhez tartozó kategóriák listája.
   */
  category: string[];

  /**
   * A termék képének URL-je.
   */
  imgUrl: string;

  /**
   * Jelzi, hogy a termék akciós-e.
   */
  sales: boolean;

  /**
   * Jelzi, hogy a termék kiemelt-e a főoldalon.
   */
  featured: boolean;

  /**
   * A termék URL-barát neve, amelyet az útvonalban használunk.
   */
  slug: string;
}
