import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-24 right-6 z-[200] space-y-4 max-w-sm pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto flex items-start gap-4 p-5 rounded-[24px] shadow-2xl backdrop-blur-xl border-l-4 transition-all duration-500 animate-slide-in relative overflow-hidden group"
          [class]="getToastClasses(toast.type)">
          
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-0"></div>

          <!-- Icon Context -->
          <div class="w-10 h-10 rounded-xl flex items-center justify-center relative z-10 flex-shrink-0" [class]="getIconClasses(toast.type)">
            <span class="material-symbols-outlined text-xl">{{ getIcon(toast.type) }}</span>
          </div>

          <!-- Message Payload -->
          <div class="flex-1 pt-1 relative z-10">
            <p class="font-headline font-black text-[10px] uppercase tracking-widest opacity-40 mb-1">System Message</p>
            <p class="font-headline font-bold text-sm leading-tight text-on-surface">{{ toast.message }}</p>
          </div>

          <!-- Interaction -->
          <button (click)="toastService.removeToast(toast.id)" 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-outline-variant hover:bg-surface-container transition-colors relative z-10">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn { from { transform: translateX(120%) scale(0.9); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
    .animate-slide-in { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  getToastClasses(type: string): string {
    const base = 'bg-surface-container-lowest border-outline-variant/10 ';
    switch (type) {
      case 'error': return base + 'border-l-error border-error/20';
      case 'success': return base + 'border-l-success border-success/20';
      case 'warning': return base + 'border-l-warning border-warning/20';
      default: return base + 'border-l-primary border-primary/20';
    }
  }

  getIconClasses(type: string): string {
    switch (type) {
      case 'error': return 'bg-error/10 text-error';
      case 'success': return 'bg-success/10 text-success';
      case 'warning': return 'bg-warning/10 text-warning';
      default: return 'bg-primary/10 text-primary';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'error': return 'report';
      case 'success': return 'verified';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }
}
