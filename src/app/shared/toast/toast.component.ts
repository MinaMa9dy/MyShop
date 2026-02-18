import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container fixed top-20 right-4 z-50 max-w-sm">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="toast-item px-4 py-3 rounded-lg shadow-lg mb-2 flex items-start animate-slide-in"
          [class.bg-red-500]="toast.type === 'error'"
          [class.bg-green-500]="toast.type === 'success'"
          [class.bg-yellow-500]="toast.type === 'warning'"
          [class.bg-blue-500]="toast.type === 'info'"
          [class.text-white]="true">
          <div class="flex-1">
            <p class="font-medium">{{ toast.message }}</p>
          </div>
          <button 
            (click)="toastService.removeToast(toast.id)"
            class="ml-2 text-white hover:text-gray-200">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
