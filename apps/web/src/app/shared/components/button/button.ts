import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [disabled]="disabled() || loading()"
      (click)="onClick()"
      [ngClass]="buttonClasses()"
      class="btn rounded-full shadow-sm transition-all flex items-center justify-center gap-2 px-8 font-semibold font-['Plus_Jakarta_Sans'] disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 active:scale-95"
    >
      @if (loading()) {
        <span class="loading loading-spinner loading-sm"></span>
      }

      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class ButtonComponent {
  // Configurações
  variant = input<ButtonVariant>('primary');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);

  // Classe dinâmica via sinal computado
  buttonClasses = computed(() => {
    switch (this.variant()) {
      case 'primary':
        return 'border-none bg-primary hover:bg-primary/90 text-white focus:ring-primary';
      case 'secondary':
        return 'border-none bg-secondary hover:bg-secondary/90 text-white focus:ring-secondary';
      case 'outline':
        return 'btn-outline border-primary text-primary hover:bg-primary hover:text-white hover:border-primary focus:ring-primary';
      case 'ghost':
        return 'btn-ghost text-primary hover:bg-primary/10 focus:ring-primary';
      default:
        return 'border-none bg-primary hover:bg-primary/90 text-white focus:ring-primary';
    }
  });

  // Evento
  clickEvent = output<void>();

  onClick() {
    if (!this.disabled() && !this.loading()) {
      this.clickEvent.emit();
    }
  }
}
