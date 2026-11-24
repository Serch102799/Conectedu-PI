import { TestBed } from '@angular/core/testing';

import { Tutorias } from './tutorias';

describe('Tutorias', () => {
  let service: Tutorias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tutorias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
