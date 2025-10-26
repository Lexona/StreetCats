import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSignalComponent } from './add-signal.component';

describe('AddSignalComponent', () => {
  let component: AddSignalComponent;
  let fixture: ComponentFixture<AddSignalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSignalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSignalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
