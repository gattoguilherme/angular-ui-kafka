import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [OrderFormComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly title = 'Coffee Order System';
}
