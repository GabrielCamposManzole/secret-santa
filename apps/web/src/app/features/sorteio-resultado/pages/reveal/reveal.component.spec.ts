import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RevealComponent } from './reveal.component';

describe('RevealComponent', () => {
  let component: RevealComponent;
  let fixture: ComponentFixture<RevealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevealComponent],
      providers: [provideRouter([{ path: '**', children: [] }])]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RevealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
