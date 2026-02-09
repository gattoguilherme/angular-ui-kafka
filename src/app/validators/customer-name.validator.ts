import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function customerNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // If empty, return null and let Validators.required handle it
    if (!value) {
      return null;
    }

    // Match Go validation: only letters, digits, hyphens
    const validPattern = /^[a-zA-Z0-9-]+$/;

    if (!validPattern.test(value)) {
      return {
        invalidCustomerName: {
          value: control.value,
          message: 'Customer name can only contain letters, digits, or hyphens'
        }
      };
    }

    return null;
  };
}
