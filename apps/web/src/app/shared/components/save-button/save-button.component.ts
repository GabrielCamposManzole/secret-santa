import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Save } from 'lucide-angular';

@Component({
  selector: 'app-save-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      [disabled]="disabled() || loading()"
      (click)="onClick()"
      class="bg-primary text-surface rounded-full shadow-sm hover:opacity-90 focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 px-6 py-3 font-semibold font-['Plus_Jakarta_Sans']"
    >
      @if (loading()) {
        <!-- Spinner nativo ou do DaisyUI se configurado -->
        <span class="loading loading-spinner loading-sm"></span>
        <span>Salvando...</span>
      } @else {
        <lucide-icon [img]="SaveIcon" size="18" strokeWidth="2"></lucide-icon>
        <span>{{ label() }}</span>
      }
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class SaveButtonComponent {
  // Ícone Lucide disponibilizado para o template
  readonly SaveIcon = Save;

  // Signal Inputs (Angular 17.1+)
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  label = input<string>('Salvar');

  // Signal Output
  save = output<void>();

  onClick() {
    if (!this.disabled() && !this.loading()) {
      this.save.emit();
    }
  }
}
