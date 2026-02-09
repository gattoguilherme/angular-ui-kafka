import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order, OrderResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/order';

  placeOrder(order: Order): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, order).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while placing order';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an error response
      // The error.error might be a string (from Go backend) or an object
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error?.msg) {
        errorMessage = error.error.msg;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
