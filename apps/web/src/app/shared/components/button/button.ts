import { Component, model, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  readonly label = model<string>('Botão');
  readonly type = input<string>('button');
  readonly disabled = input<boolean>(false);
}
