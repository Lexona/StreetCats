import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalsListComponent } from './signals-list.component';

describe('SignalsListComponent', () => {
  let component: SignalsListComponent;
  let fixture: ComponentFixture<SignalsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
