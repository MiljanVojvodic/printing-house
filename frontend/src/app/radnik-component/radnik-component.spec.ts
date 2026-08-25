import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadnikComponent } from './radnik-component';

describe('RadnikComponent', () => {
  let component: RadnikComponent;
  let fixture: ComponentFixture<RadnikComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadnikComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadnikComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
