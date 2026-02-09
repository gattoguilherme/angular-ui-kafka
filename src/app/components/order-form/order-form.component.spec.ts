import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OrderFormComponent } from './order-form.component';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';

describe('OrderFormComponent', () => {
  let component: OrderFormComponent;
  let fixture: ComponentFixture<OrderFormComponent>;
  let orderService: jest.Mocked<OrderService>;
  let toastService: jest.Mocked<ToastService>;

  beforeEach(async () => {
    const orderServiceMock = {
      placeOrder: jest.fn()
    };

    const toastServiceMock = {
      showSuccess: jest.fn(),
      showError: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [OrderFormComponent],
      providers: [
        { provide: OrderService, useValue: orderServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    orderService = TestBed.inject(OrderService) as jest.Mocked<OrderService>;
    toastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;

    fixture = TestBed.createComponent(OrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.orderForm.value).toEqual({
      customer_name: '',
      coffee_type: ''
    });
  });

  it('should validate required fields', () => {
    const form = component.orderForm;
    expect(form.valid).toBeFalsy();

    form.patchValue({
      customer_name: 'john',
      coffee_type: 'espresso'
    });

    expect(form.valid).toBeTruthy();
  });

  it('should validate customer name format', () => {
    const control = component.orderForm.get('customer_name');

    control?.setValue('john doe');
    expect(control?.hasError('invalidCustomerName')).toBeTruthy();

    control?.setValue('john-123');
    expect(control?.valid).toBeTruthy();
  });

  it('should not allow submission with invalid form', () => {
    component.onSubmit();

    expect(orderService.placeOrder).not.toHaveBeenCalled();
  });

  it('should submit valid form', (done) => {
    const mockResponse = { success: true, msg: 'Order placed!' };
    orderService.placeOrder.mockReturnValue(of(mockResponse));

    component.orderForm.patchValue({
      customer_name: 'john',
      coffee_type: 'espresso'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(orderService.placeOrder).toHaveBeenCalledWith({
        customer_name: 'john',
        coffee_type: 'espresso'
      });
      expect(toastService.showSuccess).toHaveBeenCalledWith(
        'Order for john (espresso) placed successfully!'
      );
      done();
    }, 10);
  });

  it('should handle submission error', (done) => {
    const error = new Error('API Error');
    orderService.placeOrder.mockReturnValue(throwError(() => error));

    component.orderForm.patchValue({
      customer_name: 'john',
      coffee_type: 'espresso'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(toastService.showError).toHaveBeenCalledWith('API Error');
      done();
    }, 10);
  });

  it('should show loading state during submission', (done) => {
    orderService.placeOrder.mockReturnValue(of({ success: true, msg: '' }));

    expect(component.isLoading()).toBe(false);

    component.orderForm.patchValue({
      customer_name: 'john',
      coffee_type: 'espresso'
    });

    component.onSubmit();

    // Check loading state is set
    expect(component.isLoading()).toBe(true);

    setTimeout(() => {
      expect(component.isLoading()).toBe(false);
      done();
    }, 10);
  });

  it('should reset form after successful submission', (done) => {
    orderService.placeOrder.mockReturnValue(of({ success: true, msg: '' }));

    component.orderForm.patchValue({
      customer_name: 'john',
      coffee_type: 'espresso'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(component.orderForm.value).toEqual({
        customer_name: null,
        coffee_type: null
      });
      done();
    }, 10);
  });

  it('should disable submit button when form is invalid', () => {
    expect(component.isSubmitDisabled()).toBe(true);

    component.orderForm.patchValue({
      customer_name: 'john',
      coffee_type: 'espresso'
    });

    expect(component.isSubmitDisabled()).toBe(false);
  });

  it('should disable submit button when loading', (done) => {
    orderService.placeOrder.mockReturnValue(of({ success: true, msg: '' }));

    component.orderForm.patchValue({
      customer_name: 'john',
      coffee_type: 'espresso'
    });

    expect(component.isSubmitDisabled()).toBe(false);

    component.onSubmit();

    expect(component.isSubmitDisabled()).toBe(true);

    setTimeout(() => {
      expect(component.isSubmitDisabled()).toBe(true); // Still disabled because form was reset
      done();
    }, 10);
  });

  it('should have coffee types array', () => {
    expect(component.coffeeTypes).toEqual([
      'espresso',
      'cappuccino',
      'latte',
      'americano',
      'macchiato',
      'mocha'
    ]);
  });

  it('should provide customer name control getter', () => {
    const control = component.customerName;
    expect(control).toBe(component.orderForm.get('customer_name'));
  });

  it('should provide coffee type control getter', () => {
    const control = component.coffeeType;
    expect(control).toBe(component.orderForm.get('coffee_type'));
  });
});
