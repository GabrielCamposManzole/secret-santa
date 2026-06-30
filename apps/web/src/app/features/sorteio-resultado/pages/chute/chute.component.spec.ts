import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ChuteComponent } from './chute.component';

describe('ChuteComponent', () => {
  let component: ChuteComponent;
  let fixture: ComponentFixture<ChuteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChuteComponent],
      providers: [provideRouter([{ path: '**', children: [] }])]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
