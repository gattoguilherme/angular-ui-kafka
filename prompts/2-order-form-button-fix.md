# SPEC: Order Form Button Enable Fix

## Issue Description

**Date:** 2026-02-08
**Component:** `OrderFormComponent`
**File:** `/angular-gui/src/app/components/order-form/order-form.component.ts`

### Problem Statement
When filling out the order form in the Angular application, the submit button was not being enabled even when all required fields were valid. The button remained disabled regardless of the form's state.

### Root Cause
The component uses `ChangeDetectionStrategy.OnPush`, which optimizes performance by only checking for changes when:
- Input properties change
- Events fire from the template
- Signals change
- Manual change detection is triggered

The issue was that the `isSubmitDisabled` computed signal was referencing `this.orderForm.invalid`, which is a **regular property** on a `FormGroup`, not a signal. In OnPush mode, when the form's validity changed (as users filled out fields), Angular had no way to know that it needed to re-evaluate the computed signal.

```typescript
// BEFORE (Broken)
protected readonly isSubmitDisabled = computed(() => {
  return this.isLoading() || this.orderForm.invalid; // ❌ Not a signal!
});
```

## Solution Implemented

### Changes Made

1. **Added `isFormInvalid` Signal** (Line 22)
   - Created a new signal to track the form's validity state
   - Initialized to `true` since the form starts empty/invalid

2. **Added Constructor with Subscription** (Lines 41-48)
   - Subscribes to `orderForm.statusChanges` observable
   - Updates the `isFormInvalid` signal whenever the form status changes
   - Sets the initial state based on the form's current validity

3. **Updated `isSubmitDisabled` Computed Signal** (Line 24)
   - Changed to use `this.isFormInvalid()` instead of `this.orderForm.invalid`
   - Now properly reactive to form validity changes

### Code Changes

```typescript
// AFTER (Fixed)
export class OrderFormComponent {
  protected readonly isLoading = signal(false);
  protected readonly isFormInvalid = signal(true); // ✅ New signal

  protected readonly isSubmitDisabled = computed(() => {
    return this.isLoading() || this.isFormInvalid(); // ✅ Now uses signal
  });

  protected readonly orderForm = this.fb.group({
    customer_name: ['', [Validators.required, customerNameValidator()]],
    coffee_type: ['', Validators.required]
  });

  constructor() {
    // ✅ Subscribe to form status changes
    this.orderForm.statusChanges.subscribe(() => {
      this.isFormInvalid.set(this.orderForm.invalid);
    });
    // ✅ Set initial state
    this.isFormInvalid.set(this.orderForm.invalid);
  }
}
```

## Technical Details

### Why This Works
1. **Reactive Forms emit status changes** - Angular's `FormGroup` has a `statusChanges` observable that emits whenever the form's validity changes
2. **Signal updates trigger change detection** - When the signal is updated via `.set()`, Angular knows to re-check any computed signals that depend on it
3. **OnPush respects signals** - Even with OnPush change detection, signal changes are detected and propagated

### Flow
1. User fills out form field
2. Form's validity changes (from INVALID to VALID)
3. `statusChanges` observable emits
4. Subscription callback updates `isFormInvalid` signal
5. `isSubmitDisabled` computed signal re-evaluates
6. Angular detects the computed signal change
7. View updates and button is enabled/disabled accordingly

## Testing

### Manual Testing Steps
1. Open the application and navigate to the order form
2. Leave both fields empty - button should be disabled
3. Fill in customer name only - button should remain disabled
4. Select a coffee type - button should now be enabled
5. Clear customer name - button should become disabled again
6. Re-fill both fields - button should be enabled

### Expected Behavior
- Button is disabled when form is invalid (empty required fields)
- Button becomes enabled immediately when all required fields are valid
- Button returns to disabled state if any required field becomes invalid
- Button is disabled while submitting (loading state)

## Files Modified

- `/angular-gui/src/app/components/order-form/order-form.component.ts`
  - Added `isFormInvalid` signal
  - Added constructor with form status subscription
  - Updated `isSubmitDisabled` computed signal

## Related Concepts

### Angular Change Detection Strategies
- **Default**: Checks the entire component tree on every browser event
- **OnPush**: Only checks when inputs change, events fire, or signals change (more performant)

### Angular Signals
- Introduced in Angular 16+ as a reactive primitive
- Provides fine-grained reactivity
- Works seamlessly with OnPush change detection
- `signal()`: Creates a writable signal
- `computed()`: Creates a derived signal that automatically updates

### Reactive Forms
- Form state is managed imperatively via FormGroup/FormControl
- Provides observables for value and status changes
- Not signal-based by default (requires bridging as shown in this fix)

## Lessons Learned

1. When using `OnPush` change detection with reactive forms, form state must be bridged to signals
2. Always subscribe to `statusChanges` or `valueChanges` when form state needs to trigger computed signals
3. Console logging in computed signals (as present in the code) can help debug change detection issues

## Future Improvements

Consider these potential enhancements:
1. **Use `toSignal()` from `@angular/core/rxjs-interop`** - Could convert `statusChanges` observable to a signal more cleanly
2. **Create a reusable utility** - If this pattern is needed in multiple forms, extract it to a utility function or custom hook
3. **Remove console.log** - The debug logging in `isSubmitDisabled` should be removed in production code

### Example using `toSignal()`:
```typescript
import { toSignal } from '@angular/core/rxjs-interop';

// In component:
protected readonly formStatus = toSignal(this.orderForm.statusChanges, {
  initialValue: 'INVALID'
});

protected readonly isSubmitDisabled = computed(() => {
  return this.isLoading() || this.formStatus() === 'INVALID';
});
```

## References

- [Angular Change Detection Strategy](https://angular.dev/best-practices/runtime-performance#using-onpush)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Reactive Forms Documentation](https://angular.dev/guide/forms/reactive-forms)
- [toSignal API Reference](https://angular.dev/api/core/rxjs-interop/toSignal)
