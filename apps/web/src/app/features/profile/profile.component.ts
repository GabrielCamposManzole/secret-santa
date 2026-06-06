import { Component, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  // Usando Signals para gerenciamento de estado moderno
  protected readonly userName = signal<string | null>('Marcos Olenka');
}
