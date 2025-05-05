import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipAssistantComponent } from './tip-assistant.component';

describe('TipAssistantComponent', () => {
  let component: TipAssistantComponent;
  let fixture: ComponentFixture<TipAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipAssistantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
