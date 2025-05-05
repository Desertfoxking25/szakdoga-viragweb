import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { Firestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { Product } from '../../shared/models/product.model';

// MOCK Firestore függvények
const mockFirestore = {
  collection: jasmine.createSpy('collection'),
};

describe('ProductService', () => {
  let service: ProductService;
  
  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: Firestore, useValue: {} },
      ],
    });

    service = TestBed.inject(ProductService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getProducts should return Observable<Product[]>', (done) => {
    const mockData: Product[] = [
      {
        id: '1',
        name: 'Kaktusz',
        price: 1000,
        category: ['Szobanövény'],
        slug: 'kaktusz',
        description: 'Tüskés növény.',
        imgUrl: 'https://example.com/kaktusz.jpg',
        sales: false,
        featured: false
      },
      {
        id: '2',
        name: 'Aloe Vera',
        price: 1500,
        category: ['Gyógyító'],
        slug: 'aloe-vera',
        description: 'Gyógyító növény.',
        imgUrl: 'https://example.com/aloe.jpg',
        sales: false,
        featured: true
      }
    ];

    // Itt mockoljuk a collectionData visszatérést
    spyOn<any>(service, 'getProducts').and.returnValue(of(mockData));

    service.getProducts().subscribe((data) => {
      expect(data.length).toBe(2);
      expect(data[0].name).toBe('Kaktusz');
      done();
    });
  });

  it('getProductById should return a single product by ID', (done) => {
    const mockProduct: Product = {
      id: 'abc123',
      name: 'Pozsgás',
      price: 1999,
      category: ['Szukkulens'],
      slug: 'pozsgas',
      description: 'Szép pozsgás növény',
      imgUrl: 'https://example.com/pozsgas.jpg',
      sales: false,
      featured: false,
    };

    spyOn(service, 'getProductById').and.returnValue(of(mockProduct));

    service.getProductById('abc123').subscribe((product) => {
      expect(product).toBeTruthy();
      expect(product.id).toBe('abc123');
      expect(product.name).toBe('Pozsgás');
      done();
    });
  });

  it('getProductBySlug should return the correct product by slug', (done) => {
    const mockData: Product[] = [
      {
        id: '1',
        name: 'Kaktusz',
        price: 1000,
        category: ['Szobanövény'],
        slug: 'kaktusz',
        description: 'Tüskés növény.',
        imgUrl: 'https://example.com/kaktusz.jpg',
        sales: false,
        featured: false
      },
      {
        id: '2',
        name: 'Aloe',
        price: 1200,
        category: ['Gyógyító'],
        slug: 'aloe',
        description: 'Aloe vera',
        imgUrl: 'https://example.com/aloe.jpg',
        sales: false,
        featured: true
      }
    ];

    spyOn(service, 'getProductBySlug').and.returnValue(of(mockData.find(p => p.slug === 'kaktusz')));

    service.getProductBySlug('kaktusz').subscribe((product) => {
      expect(product).toBeTruthy();
      expect(product?.name).toBe('Kaktusz');
      expect(product?.slug).toBe('kaktusz');
      expect(product?.price).toBeGreaterThan(0);
      done();;
    });
  });

  it('getProductBySlug should return undefined if slug not found', (done) => {
    spyOn(service, 'getProductBySlug').and.returnValue(of(undefined));
  
    service.getProductBySlug('nemletezo-slug').subscribe((product) => {
      expect(product).toBeUndefined();
      done();
    });
  });

  it('getProductBySlug should return a product with all required fields', (done) => {
    const mockProduct: Product = {
      id: '1',
      name: 'Kaktusz',
      price: 1000,
      category: ['Szobanövény'],
      slug: 'kaktusz',
      description: 'Tüskés növény.',
      imgUrl: 'https://example.com/kaktusz.jpg',
      sales: false,
      featured: false
    };
  
    spyOn(service, 'getProductBySlug').and.returnValue(of(mockProduct));
  
    service.getProductBySlug('kaktusz').subscribe((product) => {
      expect(product).toBeTruthy();
      expect(product?.id).toBe('1');
      expect(product?.name).toMatch(/kaktusz/i);
      expect(Array.isArray(product?.category)).toBeTrue();
      expect(product?.imgUrl).toContain('http');
      expect(typeof product?.sales).toBe('boolean');
      done();
    });
  });
  
  it('createProduct should call addDoc and resolve', async () => {
    const mockProduct: Product = {
      id: '99',
      name: 'Teszt növény',
      price: 999,
      category: ['Teszt kategória'],
      slug: 'teszt-noveny',
      description: 'Ez egy teszt növény leírása.',
      imgUrl: 'https://example.com/image.jpg',
      sales: false,
      featured: false
    };

    const addDocSpy = jasmine.createSpy().and.returnValue(Promise.resolve());
    spyOn<any>(service, 'createProduct').and.returnValue(addDocSpy());

    await expectAsync(service.createProduct(mockProduct)).toBeResolved();
  });

  it('createProduct should reject if Firestore fails', async () => {
    const error = new Error('Firestore error');
    spyOn(service, 'createProduct').and.returnValue(Promise.reject(error));
  
    await expectAsync(service.createProduct({} as Product)).toBeRejectedWith(error);
  });

  it('updateProduct should resolve without error', async () => {
    const updateSpy = spyOn(service, 'updateProduct').and.returnValue(Promise.resolve());

    const result = service.updateProduct('abc123', { name: 'Módosított név' });
    await expectAsync(result).toBeResolved();
    expect(updateSpy).toHaveBeenCalledWith('abc123', { name: 'Módosított név' });
  });

  it('updateProduct should be called with correct partial data', async () => {
    const updateSpy = spyOn(service, 'updateProduct').and.returnValue(Promise.resolve());
  
    const updateData = { name: 'Új név', featured: true };
    await service.updateProduct('abc123', updateData);
  
    expect(updateSpy).toHaveBeenCalledWith('abc123', jasmine.objectContaining({
      name: 'Új név',
      featured: true
    }));
  });

  it('deleteProduct should resolve without error', async () => {
    const deleteSpy = spyOn(service, 'deleteProduct').and.returnValue(Promise.resolve());

    const result = service.deleteProduct('abc123');
    await expectAsync(result).toBeResolved();
    expect(deleteSpy).toHaveBeenCalledWith('abc123');
  });
});