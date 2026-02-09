import { Injectable, signal } from '@angular/core';
import { Toast } from '../models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toasts = signal<Toast[]>([]);
  readonly toasts$ = this.toasts.asReadonly();

  showSuccess(message: string, duration = 5000): void {
    this.addToast({ message, type: 'success', duration });
  }

  showError(message: string, duration = 5000): void {
    this.addToast({ message, type: 'error', duration });
  }

  private addToast(toast: Omit<Toast, 'id'>): void {
    const id = crypto.randomUUID();
    const newToast: Toast = { ...toast, id };

    this.toasts.update(toasts => [...toasts, newToast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.removeToast(id), toast.duration);
    }
  }

  removeToast(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clearAll(): void {
    this.toasts.set([]);
  }
}
