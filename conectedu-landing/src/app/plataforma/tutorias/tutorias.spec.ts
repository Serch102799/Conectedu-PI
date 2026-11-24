import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tutorias } from './tutorias';

describe('Tutorias', () => {
  let component: Tutorias;
  let fixture: ComponentFixture<Tutorias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Tutorias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tutorias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
