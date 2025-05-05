import { TestBed } from '@angular/core/testing';
import { FaqService } from './faq.service';
import { Firestore } from '@angular/fire/firestore';
import { Faq } from '../models/faq.model';
import { of } from 'rxjs';

describe('FaqService', () => {
  let service: FaqService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FaqService,
        { provide: Firestore, useValue: {} }
      ]
    });

    service = TestBed.inject(FaqService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getFaqs should return empty array if no FAQs exist', (done) => {
    spyOn(service, 'getFaqs').and.returnValue(of([]));
  
    service.getFaqs().subscribe((faqs) => {
      expect(faqs.length).toBe(0);
      expect(faqs).toEqual([]);
      done();
    });
  });

  it('getFaqs should return list of FAQs', (done) => {
    const mockFaqs: Faq[] = [
      { id: '1', question: 'Hogyan locsoljak?', answer: 'Hetente egyszer.' },
      { id: '2', question: 'Milyen föld kell?', answer: 'Tápdús virágföld.' }
    ];

    spyOn(service, 'getFaqs').and.returnValue(of(mockFaqs));

    service.getFaqs().subscribe((faqs) => {
      expect(faqs.length).toBe(2);
      expect(faqs[0].question).toContain('locsol');
      expect(faqs[1].answer).toContain('föld');
      done();
    });
  });

  it('getFaqs should return FAQs with valid question and answer strings', (done) => {
    const mockFaqs: Faq[] = [
      { id: '1', question: 'Mennyi vizet kapjon?', answer: 'Hetente 2x.' }
    ];
  
    spyOn(service, 'getFaqs').and.returnValue(of(mockFaqs));
  
    service.getFaqs().subscribe((faqs) => {
      expect(typeof faqs[0].question).toBe('string');
      expect(typeof faqs[0].answer).toBe('string');
      expect(faqs[0].question.length).toBeGreaterThan(5);
      expect(faqs[0].answer.length).toBeGreaterThan(3);
      done();
    });
  });

  it('addFaq should resolve successfully', async () => {
    const faq: Faq = { question: 'Mikor metszem a rózsát?', answer: 'Tavasszal.' };
    const spy = spyOn(service, 'addFaq').and.returnValue(Promise.resolve());

    await expectAsync(service.addFaq(faq)).toBeResolved();
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
      question: 'Mikor metszem a rózsát?',
      answer: 'Tavasszal.'
    }));
  });

  it('addFaq should reject if Firestore fails', async () => {
    const faq: Faq = { question: 'Mikor?', answer: 'Akkor.' };
    const error = new Error('addDoc failed');
    spyOn(service, 'addFaq').and.returnValue(Promise.reject(error));

    await expectAsync(service.addFaq(faq)).toBeRejectedWith(error);
  });

  it('addFaq should throw error if question is empty (simulated)', async () => {
    const invalidFaq: Faq = { question: '', answer: 'válasz' };
    spyOn(service, 'addFaq').and.callFake(() => {
      throw new Error('A kérdés mező nem lehet üres!');
    });
  
    expect(() => service.addFaq(invalidFaq)).toThrowError('A kérdés mező nem lehet üres!');
  });

  it('deleteFaq should resolve successfully', async () => {
    const spy = spyOn(service, 'deleteFaq').and.returnValue(Promise.resolve());

    await expectAsync(service.deleteFaq('faq123')).toBeResolved();
    expect(spy).toHaveBeenCalledWith('faq123');
  });

  it('deleteFaq should reject if Firestore fails', async () => {
    const error = new Error('deleteDoc failed');
    spyOn(service, 'deleteFaq').and.returnValue(Promise.reject(error));

    await expectAsync(service.deleteFaq('faq123')).toBeRejectedWith(error);
  });
});
