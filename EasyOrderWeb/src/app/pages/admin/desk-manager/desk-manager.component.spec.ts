import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeskManagerComponent } from './desk-manager.component';

describe('DeskManagerComponent', () => {
  let component: DeskManagerComponent;
  let fixture: ComponentFixture<DeskManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeskManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeskManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
