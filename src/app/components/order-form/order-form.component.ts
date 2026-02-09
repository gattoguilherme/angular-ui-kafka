import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { Order } from '../../models';
import { customerNameValidator } from '../../validators/customer-name.validator';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule]
})
export class OrderFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly toastService = inject(ToastService);

  protected readonly isLoading = signal(false);
  protected readonly isFormInvalid = signal(true);
  protected readonly isSubmitDisabled = computed(() => {
    const disabled = this.isLoading() || this.isFormInvalid();
    console.log('Button disabled:', disabled, {
      isLoading: this.isLoading(),
      formInvalid: this.isFormInvalid(),
      formValue: this.orderForm.value,
      formErrors: this.orderForm.errors,
      customerNameErrors: this.orderForm.get('customer_name')?.errors,
      coffeeTypeErrors: this.orderForm.get('coffee_type')?.errors
    });
    return disabled;
  });

  protected readonly orderForm = this.fb.group({
    customer_name: ['', [Validators.required, customerNameValidator()]],
    coffee_type: ['', Validators.required]
  });

  constructor() {
    // Subscribe to form status changes and update the signal
    this.orderForm.statusChanges.subscribe(() => {
      this.isFormInvalid.set(this.orderForm.invalid);
    });
    // Set initial state
    this.isFormInvalid.set(this.orderForm.invalid);
  }

  protected readonly coffeeTypes = [
    'espresso',
    'cappuccino',
    'latte',
    'americano',
    'macchiato',
    'mocha'
  ];

  get customerName() {
    return this.orderForm.get('customer_name')!;
  }

  get coffeeType() {
    return this.orderForm.get('coffee_type')!;
  }

  ngOnInit() {
    console.log("teste  ")
  }

  onSubmit(): void {
    if (this.orderForm.invalid) return;

    this.isLoading.set(true);
    const order = this.orderForm.value as Order;

    this.orderService.placeOrder(order)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.showSuccess(
            `Order for ${order.customer_name} (${order.coffee_type}) placed successfully!`
          );
          this.orderForm.reset();
        },
        error: (error: Error) => {
          this.toastService.showError(error.message);
        }
      });
  }
}
