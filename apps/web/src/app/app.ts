import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent } from './shared/components/button/button';
import { SaveButtonComponent } from './shared/components/save-button/save-button.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonComponent, SaveButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('web');
}
