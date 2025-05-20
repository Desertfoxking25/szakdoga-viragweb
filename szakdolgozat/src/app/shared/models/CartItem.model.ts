/**
 * Egy kosárban szereplő egyetlen terméket reprezentál.
 */
export interface CartItem {
  /**
   * A termék Firestore dokumentumának azonosítója.
   */
  productId: string;

  /**
   * A termék neve, megjelenítéshez és azonosításhoz.
   */
  name: string;

  /**
   * A termék egységára forintban.
   */
  price: number;

  /**
   * A termék képe (URL formátumban).
   */
  imgUrl: string;

  /**
   * A megvásárolni kívánt darabszám ebből a termékből.
   */
  quantity: number;
}

/**
 * Egy felhasználó teljes kosarának adatszerkezete.
 * Minden felhasználónak egy dokumentuma van a `carts` kollekcióban.
 */
export interface Cart {
  /**
   * A felhasználó Firebase UID-ja.
   */
  userId: string;

  /**
   * A kosárban szereplő termékek listája.
   */
  items: CartItem[];
}
