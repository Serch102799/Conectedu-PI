import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelTutor } from './panel-tutor.component';

describe('PanelTutor', () => {
  let component: PanelTutor;
  let fixture: ComponentFixture<PanelTutor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PanelTutor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelTutor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
