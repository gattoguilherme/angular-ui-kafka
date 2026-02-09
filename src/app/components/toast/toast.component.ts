import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { ToastType } from '../../models';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  protected readonly toasts = this.toastService.toasts$;

  onClose(id: string): void {
    this.toastService.removeToast(id);
  }

  getAlertClass(type: ToastType): string {
    return type === 'success' ? 'alert-success' : 'alert-danger';
  }

  getAriaRole(type: ToastType): string {
    return type === 'error' ? 'alert' : 'status';
  }
}
