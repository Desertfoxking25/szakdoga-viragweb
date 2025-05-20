import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../shared/services/product.service';
import { Product } from '../../../shared/models/product.model';
import { MatDialog } from '@angular/material/dialog';
import { ProductFormComponent } from './product-form/product-form.component';

/**
 * Adminfelület a termékek kezelésére.
 * Lehetővé teszi a termékek listázását, keresését, szerkesztését, létrehozását és törlését.
 */
@Component({
  selector: 'app-product-admin',
  templateUrl: './product-admin.component.html',
  styleUrls: ['./product-admin.component.scss'],
  standalone: false
})
export class ProductAdminComponent implements OnInit {

  /** Az összes termék */
  products: Product[] = [];

  /** A keresési feltételeknek megfelelő termékek */
  filteredProducts: Product[] = [];

  /** Keresőmező szövege */
  searchTerm: string = '';

  /** A megjelenítendő oszlopok az admin táblázatban */
  displayedColumns: string[] = ['img', 'name', 'price', 'category', 'sales', 'featured', 'slug', 'description', 'actions'];

  constructor(
    private productService: ProductService,
    private dialog: MatDialog
  ) {}

  /**
   * Komponens inicializálásakor betölti a termékeket.
   */
  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Termékek betöltése Firestore-ból.
   * Frissíti az alap és a szűrt listát is.
   */
  loadProducts(): void {
    this.productService.getProducts().subscribe((res) => {
      this.products = res;
      this.filteredProducts = res;
    });
  }

  /**
   * Termékek szűrése név alapján a `searchTerm` szerint.
   */
  filterProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(term)
    );
  }

  /**
   * Új termék létrehozása dialógusablak segítségével.
   * Ha sikeres volt a létrehozás, újratölti a terméklistát.
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadProducts();
      }
    });
  }

  /**
   * Meglévő termék szerkesztése dialógusablakban.
   * @param product A szerkesztendő termék
   */
  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      data: {
        mode: 'edit',
        product: product
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadProducts();
      }
    });
  }

  /**
   * Termék törlése megerősítés után.
   * Sikeres törlés után frissíti a listát.
   * A terméket törli a Firestore-ból, és ha van hozzá kép URL, azt is törli a Storage-ból.
   * @param productId A törlendő termék azonosítója
   */
  deleteProduct(productId: string): void {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    if (confirm('Biztosan törlöd ezt a terméket?')) {
      this.productService.deleteProduct(productId).then(() => {
        if (product.imgUrl) {
          this.productService.deleteImageByUrl(product.imgUrl).catch(err => {
            console.warn('Kép törlése nem sikerült:', err);
          });
        }
        this.loadProducts();
      }).catch((error) => {
        console.error('Hiba történt a törlés során:', error);
      });
    }
  }
}
