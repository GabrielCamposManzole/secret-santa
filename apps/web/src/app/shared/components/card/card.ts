import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  group = input.required<any>();
  isOwner = input<boolean>(false);

  startDraw = output<void>();
  play = output<void>();

  onStartDrawClick(event: Event): void {
    event.stopPropagation();
    this.startDraw.emit();
  }

  onPlayClick(event: Event): void {
    event.stopPropagation();
    this.play.emit();
  }
}
