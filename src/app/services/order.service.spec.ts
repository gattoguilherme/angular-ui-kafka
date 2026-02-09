import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrderService } from './order.service';
import { Order, OrderResponse } from '../models';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should place order successfully', (done) => {
    const mockOrder: Order = {
      customer_name: 'john',
      coffee_type: 'espresso'
    };
    const mockResponse: OrderResponse = {
      success: true,
      msg: 'Order for john placed successfully!'
    };

    service.placeOrder(mockOrder).subscribe({
      next: (response) => {
        expect(response).toEqual(mockResponse);
        expect(response.success).toBe(true);
        expect(response.msg).toContain('john');
        done();
      },
      error: () => done.fail('Should not have failed')
    });

    const req = httpMock.expectOne('/api/order');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockOrder);
    req.flush(mockResponse);
  });

  it('should handle 400 error (validation failure)', (done) => {
    const mockOrder: Order = {
      customer_name: 'john doe',
      coffee_type: 'espresso'
    };

    service.placeOrder(mockOrder).subscribe({
      next: () => done.fail('Should have failed'),
      error: (error: Error) => {
        expect(error.message).toContain('key contains space');
        done();
      }
    });

    const req = httpMock.expectOne('/api/order');
    req.flush('key contains space or special characters', {
      status: 400,
      statusText: 'Bad Request'
    });
  });

  it('should handle 400 error (empty customer name)', (done) => {
    const mockOrder: Order = {
      customer_name: '',
      coffee_type: 'espresso'
    };

    service.placeOrder(mockOrder).subscribe({
      next: () => done.fail('Should have failed'),
      error: (error: Error) => {
        expect(error.message).toContain('key cannot be empty');
        done();
      }
    });

    const req = httpMock.expectOne('/api/order');
    req.flush('key cannot be empty', {
      status: 400,
      statusText: 'Bad Request'
    });
  });

  it('should handle 500 error (Kafka failure)', (done) => {
    const mockOrder: Order = {
      customer_name: 'john',
      coffee_type: 'espresso'
    };

    service.placeOrder(mockOrder).subscribe({
      next: () => done.fail('Should have failed'),
      error: (error: Error) => {
        expect(error).toBeDefined();
        expect(error.message).toBeTruthy();
        done();
      }
    });

    const req = httpMock.expectOne('/api/order');
    req.flush('Kafka connection error', {
      status: 500,
      statusText: 'Internal Server Error'
    });
  });

  it('should handle network error', (done) => {
    const mockOrder: Order = {
      customer_name: 'john',
      coffee_type: 'espresso'
    };

    service.placeOrder(mockOrder).subscribe({
      next: () => done.fail('Should have failed'),
      error: (error: Error) => {
        expect(error).toBeDefined();
        done();
      }
    });

    const req = httpMock.expectOne('/api/order');
    req.error(new ProgressEvent('Network error'));
  });
});
