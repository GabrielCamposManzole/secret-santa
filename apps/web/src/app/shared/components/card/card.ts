import { Component, input, output } from '@angular/core';
import { GrupoComParticipacao } from '../../../core/models';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  group = input.required<GrupoComParticipacao>();
  isOwner = input<boolean>(false);

  startDraw = output<void>();
  playQuest = output<void>();

  onStartDrawClick(event: Event): void {
    event.stopPropagation();
    this.startDraw.emit();
  }

  onPlayClick(event: Event): void {
    event.stopPropagation();
    this.playQuest.emit();
  }
}
