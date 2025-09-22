import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scene3d } from './scene3d';

describe('Scene3d', () => {
  let component: Scene3d;
  let fixture: ComponentFixture<Scene3d>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scene3d]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Scene3d);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
