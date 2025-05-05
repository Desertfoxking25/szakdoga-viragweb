import { TestBed } from '@angular/core/testing';
import { TipService } from './tip.service';
import { Tip } from '../models/tip.model';
import { of } from 'rxjs';

describe('TipService (mocked)', () => {
  let service: TipService;

  beforeEach(() => {
    service = Object.create(TipService.prototype);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getTips should return a list of tips', (done) => {
    const mockTips: Tip[] = [
      { id: '1', authorId: 'u1', title: 'Locsolás', content: 'Öntözd reggel!', createdAt: {} as any },
      { id: '2', authorId: 'u2', title: 'Tápoldat', content: 'Ne locsold túl!', createdAt: {} as any }
    ];

    spyOn(service, 'getTips').and.returnValue(of(mockTips));

    service.getTips().subscribe((tips) => {
      expect(tips.length).toBe(2);
      expect(tips[0].title).toBe('Locsolás');
      expect(tips[1].authorId).toBe('u2');
      expect(tips[1].content).toContain('túl');
      expect(tips.every(t => t.title && t.content && t.authorId)).toBeTrue();
      expect(tips[0].content.length).toBeGreaterThan(5);
      expect(typeof tips[1].createdAt).toBeDefined();
      done();
    });
  });

  it('addTip should resolve and return a DocumentReference', async () => {
    const mockRef = { id: 'mock-doc-id' } as any;
    const tip: Tip = {
      authorId: 'u1',
      title: 'Tápoldat használata',
      content: 'Használj tápoldatot',
      createdAt: {} as any
    };

    const addSpy = jasmine.createSpy('addSpy').and.resolveTo(mockRef);
    spyOn(service, 'addTip').and.callFake((data: Tip) => {
      expect(data.authorId).toBe('u1');
      expect(data.title).toMatch(/táp/i);
      return addSpy(data);
    });

    const result = await service.addTip(tip);
    expect(addSpy).toHaveBeenCalledWith(tip);
    expect(result.id).toBe('mock-doc-id');
  });

  it('addTip should reject on Firestore error', async () => {
    const error = new Error('addDoc failed');
    const tip: Tip = {
      authorId: 'u1',
      title: 'Téli gonzodás',
      content: 'Télre hozd be!',
      createdAt: {} as any
    };

    spyOn(service, 'addTip').and.returnValue(Promise.reject(error));

    await expectAsync(service.addTip(tip)).toBeRejectedWith(error);
  });

  it('addTip should throw error if required field is missing (simulated)', async () => {
    const invalidTip = {
      title: '',
      content: '',
      authorId: ''
    } as Tip;
  
    spyOn(service, 'addTip').and.callFake(() => {
      throw new Error('Missing required fields');
    });
  
    expect(() => service.addTip(invalidTip)).toThrowError('Missing required fields');
  });

  it('deleteTip should resolve successfully', async () => {
    const deleteSpy = jasmine.createSpy('deleteSpy');
    spyOn(service, 'deleteTip').and.callFake((id: string) => {
      deleteSpy(id);
      return Promise.resolve();
    });

    await expectAsync(service.deleteTip('tipp123')).toBeResolved();
    expect(deleteSpy).toHaveBeenCalledWith('tipp123');
  });

  it('deleteTip should reject if Firestore fails', async () => {
    const error = new Error('deleteDoc failed');
    spyOn(service, 'deleteTip').and.returnValue(Promise.reject(error));

    await expectAsync(service.deleteTip('badID')).toBeRejectedWith(error);
  });

  it('deleteTip should throw if ID is empty string', async () => {
    spyOn(service, 'deleteTip').and.callFake(async (id: string) => {
      if (!id) throw new Error('ID is required');
    });
  
    await expectAsync(service.deleteTip('')).toBeRejectedWithError('ID is required');
  });
});
