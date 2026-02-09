import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success toast', () => {
    service.showSuccess('Order placed!');

    const toasts = service.toasts$();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Order placed!');
    expect(toasts[0].id).toBeTruthy();
  });

  it('should show error toast', () => {
    service.showError('Error occurred!');

    const toasts = service.toasts$();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('error');
    expect(toasts[0].message).toBe('Error occurred!');
  });

  it('should auto-dismiss toast after duration', fakeAsync(() => {
    service.showSuccess('Test message', 1000);

    expect(service.toasts$().length).toBe(1);

    tick(1000);

    expect(service.toasts$().length).toBe(0);
  }));

  it('should not auto-dismiss if duration is 0', fakeAsync(() => {
    service.showSuccess('Test message', 0);

    expect(service.toasts$().length).toBe(1);

    tick(5000);

    expect(service.toasts$().length).toBe(1);
  }));

  it('should remove toast manually', () => {
    service.showSuccess('Test');
    const id = service.toasts$()[0].id;

    service.removeToast(id);

    expect(service.toasts$().length).toBe(0);
  });

  it('should handle multiple toasts', () => {
    service.showSuccess('First');
    service.showError('Second');
    service.showSuccess('Third');

    const toasts = service.toasts$();
    expect(toasts.length).toBe(3);
    expect(toasts[0].message).toBe('First');
    expect(toasts[1].message).toBe('Second');
    expect(toasts[2].message).toBe('Third');
  });

  it('should clear all toasts', () => {
    service.showSuccess('First');
    service.showError('Second');
    service.showSuccess('Third');

    expect(service.toasts$().length).toBe(3);

    service.clearAll();

    expect(service.toasts$().length).toBe(0);
  });

  it('should generate unique IDs for each toast', () => {
    service.showSuccess('First');
    service.showSuccess('Second');

    const toasts = service.toasts$();
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it('should only remove specific toast by ID', () => {
    service.showSuccess('First');
    service.showSuccess('Second');
    service.showSuccess('Third');

    const toasts = service.toasts$();
    const middleToastId = toasts[1].id;

    service.removeToast(middleToastId);

    const remainingToasts = service.toasts$();
    expect(remainingToasts.length).toBe(2);
    expect(remainingToasts[0].message).toBe('First');
    expect(remainingToasts[1].message).toBe('Third');
  });
});
