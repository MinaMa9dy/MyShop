import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastId = 0;
  toasts = signal<Toast[]>([]);
  
  showError(message: string, duration: number = 5000): void {
    this.addToast(message, 'error', duration);
  }
  
  showSuccess(message: string, duration: number = 3000): void {
    this.addToast(message, 'success', duration);
  }
  
  showWarning(message: string, duration: number = 4000): void {
    this.addToast(message, 'warning', duration);
  }
  
  showInfo(message: string, duration: number = 3000): void {
    this.addToast(message, 'info', duration);
  }
  
  private addToast(message: string, type: Toast['type'], duration: number): void {
    const toast: Toast = {
      id: ++this.toastId,
      message,
      type,
      duration
    };
    
    this.toasts.update(toasts => [...toasts, toast]);
    
    // Auto remove after duration
    setTimeout(() => {
      this.removeToast(toast.id);
    }, duration);
  }
  
  removeToast(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
