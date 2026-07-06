import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Card } from './card';

describe('Card', () => {
  let component: Card;
  let fixture: ComponentFixture<Card>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Card],
    }).compileComponents();

    fixture = TestBed.createComponent(Card);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('group', {
      id: '1',
      nome: 'Grupo Teste',
      token: 'token123',
      sorteado: false,
      finalizado: false,
      dono_id: 'owner123',
      usuarioGrupoId: 'ug123',
      jogado: false,
      resultado: false,
      preenchido_caracteristicas: false,
      id_pessoa_sorteada: null,
      participantsCount: 5,
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
