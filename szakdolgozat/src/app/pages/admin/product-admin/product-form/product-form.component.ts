import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../../../shared/models/product.model';
import { ProductService } from '../../../../shared/services/product.service';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Dialóguskomponens termék létrehozásához vagy szerkesztéséhez.
 * Kezeli a kép feltöltését a Firebase Storage-ba, 
 * és frissíti vagy létrehozza a terméket a Firestore-ban.
 */
@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  standalone: false
})
export class ProductFormComponent {
  /** A kategóriákat vesszővel elválasztva tároljuk szövegként */
  categoryString: string = '';

  /** A felhasználó által kiválasztott új fájl (kép) */
  selectedFile: File | null = null;

  /** A régi kép URL-je szerkesztéskor, hogy törölni tudjuk ha megváltozik */
  oldImgUrl: string | null = null;

  isSaving: boolean = false;

  /** A szerkesztett vagy létrehozandó termék alapértelmezett struktúrája */
  product: Product = {
    name: '',
    description: '',
    price: 0,
    category: [],
    imgUrl: '',
    sales: false,
    featured: false,
    slug: ''
  };

  /**
   * Konstruktor, amely beállítja a szerkesztési módot, és betölti a meglévő termékadatokat ha szükséges.
   * @param dialogRef A dialógus referenciája (bezáráshoz)
   * @param productService A termékek Firestore-kezeléséért felelős szolgáltatás
   * @param snackBar Material SnackBar visszajelzésekhez
   * @param data A dialógusnak átadott adatok (mód: create/edit, opcionális meglévő termék)
   */
  constructor(
    private dialogRef: MatDialogRef<ProductFormComponent>,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', product?: Product }
  ) {
    // Szerkesztési mód esetén előtöltjük a meglévő adatokat
    if (data.mode === 'edit' && data.product) {
      this.product = { ...data.product };
      this.oldImgUrl = this.product.imgUrl;
      this.categoryString = this.product.category.join(', ');
    }
  }

  /**
   * A form mentése:
   * - kategóriák feldolgozása szövegből tömbbé,
   * - ha van új kép: feltöltés és URL beállítás,
   * - Firestore adatmentés (create vagy update),
   * - ha új kép került be: a régi törlése Storage-ból.
   */
  async save(): Promise<void> {
    // Kezdődik a mentés
    this.isSaving = true;

    // A kategória szöveget tömbbé alakítjuk (vesszőkkel elválasztva)
    this.product.category = this.categoryString
      .split(',')
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 0);

    // Ha van új fájl, feltöltjük a Firebase Storage-be
    if (this.selectedFile) {
      const storage = getStorage();
      const filePath = `${Date.now()}_${this.selectedFile.name}`; // egyedi fájlnév
      const storageRef = ref(storage, filePath);

      try {
        await uploadBytes(storageRef, this.selectedFile);           // fájl feltöltése
        const url = await getDownloadURL(storageRef);              // letöltési URL lekérése
        this.product.imgUrl = url;

        this.snackBar.open('✅ Kép feltöltve!', 'Bezárás', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
      } catch (err) {
        this.isSaving = false;
        console.error('Kép feltöltési hiba:', err);
        this.snackBar.open('❌ Hiba a kép feltöltésekor!', 'Bezárás', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
        return; // ne menj tovább, ha a kép nem töltődött fel
      }
    }

    // Termék létrehozása vagy frissítése Firestore-ban
    if (this.data.mode === 'create') {
      this.productService.createProduct(this.product).then(() => {
        this.dialogRef.close('refresh'); // dialógus bezárása és lista frissítés
      });
    } else {
      this.productService.updateProduct(this.product.id!, this.product).then(() => {
        this.dialogRef.close('refresh');
      });
    }

    // Ha új képet töltöttünk fel és változott az URL, akkor töröljük a régit
    if (this.data.mode === 'edit' && this.oldImgUrl && this.oldImgUrl !== this.product.imgUrl) {
      const storage = getStorage();
      const decodedUrl = decodeURIComponent(this.oldImgUrl.split('?')[0]); // pl. 'products%2Fkep.jpg'
      const path = decodedUrl.split('/o/')[1]; // kinyerjük a tárolt útvonalat
      const oldRef = ref(storage, path);

      deleteObject(oldRef).catch(err => {
        console.warn('Régi kép törlése nem sikerült:', err); // nem kritikus, de logoljuk
      });
    }

    this.isSaving = false;
  }

  /**
   * A dialógus bezárása mentés nélkül.
   */
  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Fájl kiválasztása fájlböngészőből.
   * @param event Az input eseménye (tartalmazza a kiválasztott fájlt)
   */
  onFileSelected(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.[0] || null;
  }
}
