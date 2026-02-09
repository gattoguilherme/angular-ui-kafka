import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../services/toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent]
    }).compileComponents();

    toastService = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display success toast', () => {
    toastService.showSuccess('Order placed!');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const alert = compiled.querySelector('.alert-success');

    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain('Order placed!');
  });

  it('should display error toast', () => {
    toastService.showError('Error occurred!');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const alert = compiled.querySelector('.alert-danger');

    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain('Error occurred!');
  });

  it('should display multiple toasts', () => {
    toastService.showSuccess('First');
    toastService.showError('Second');
    toastService.showSuccess('Third');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const alerts = compiled.querySelectorAll('.alert');

    expect(alerts.length).toBe(3);
  });

  it('should remove toast when close button is clicked', () => {
    toastService.showSuccess('Test message');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const closeButton = compiled.querySelector('.btn-close') as HTMLButtonElement;

    expect(toastService.toasts$().length).toBe(1);

    closeButton.click();
    fixture.detectChanges();

    expect(toastService.toasts$().length).toBe(0);
  });

  it('should have correct ARIA attributes for error toast', () => {
    toastService.showError('Error');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const alert = compiled.querySelector('.alert-danger');

    expect(alert?.getAttribute('role')).toBe('alert');
    expect(alert?.getAttribute('aria-live')).toBe('polite');
    expect(alert?.getAttribute('aria-atomic')).toBe('true');
  });

  it('should have correct ARIA attributes for success toast', () => {
    toastService.showSuccess('Success');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const alert = compiled.querySelector('.alert-success');

    expect(alert?.getAttribute('role')).toBe('status');
    expect(alert?.getAttribute('aria-live')).toBe('polite');
    expect(alert?.getAttribute('aria-atomic')).toBe('true');
  });

  it('should have accessible close button', () => {
    toastService.showSuccess('Test');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const closeButton = compiled.querySelector('.btn-close');

    expect(closeButton?.getAttribute('aria-label')).toBe('Close');
  });

  it('should return correct alert class for success type', () => {
    expect(component.getAlertClass('success')).toBe('alert-success');
  });

  it('should return correct alert class for error type', () => {
    expect(component.getAlertClass('error')).toBe('alert-danger');
  });

  it('should return correct ARIA role for success type', () => {
    expect(component.getAriaRole('success')).toBe('status');
  });

  it('should return correct ARIA role for error type', () => {
    expect(component.getAriaRole('error')).toBe('alert');
  });
});
